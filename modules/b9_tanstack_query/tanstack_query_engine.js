// ============================================================================
// B9 / DEV-FE-009: TANSTACK QUERY (REACT QUERY v5) CORE ENGINE SIMULATOR
// Caching, Stale-While-Revalidate, Query Invalidation, Mutations, and Optimistic Updates
// ============================================================================

/**
 * Chuẩn hóa queryKey thành key string duy nhất dùng làm cache index
 */
export function hashQueryKey(queryKey) {
  if (typeof queryKey === 'string') return queryKey;
  if (Array.isArray(queryKey)) {
    return JSON.stringify(queryKey);
  }
  return JSON.stringify(queryKey);
}

/**
 * Lớp đại diện cho một Single Query trong Cache
 */
export class Query {
  constructor(options) {
    this.queryKey = options.queryKey;
    this.queryHash = hashQueryKey(options.queryKey);
    this.queryFn = options.queryFn;
    this.staleTime = options.staleTime ?? 5000; // Mặc định 5s
    this.gcTime = options.gcTime ?? 5 * 60 * 1000; // 5 phút

    this.state = {
      data: undefined,
      error: null,
      status: 'pending', // 'pending' | 'success' | 'error'
      isFetching: false,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0
    };

    this.subscribers = new Set();
    this.gcTimeout = null;
    this.activePromise = null;
  }

  isStale() {
    if (this.state.status === 'pending') return true;
    if (this.staleTime === Infinity) return false;
    return Date.now() - this.state.dataUpdatedAt > this.staleTime;
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    if (this.gcTimeout) {
      clearTimeout(this.gcTimeout);
      this.gcTimeout = null;
    }
    return () => {
      this.subscribers.delete(listener);
      if (this.subscribers.size === 0) {
        this.scheduleGarbageCollection();
      }
    };
  }

  notify() {
    this.subscribers.forEach(listener => listener(this.state));
  }

  scheduleGarbageCollection() {
    if (this.gcTime > 0 && !this.gcTimeout) {
      this.gcTimeout = setTimeout(() => {
        // Query client sẽ xóa query này nếu không còn ai subscribe
        this.client?.removeQuery(this.queryHash);
      }, this.gcTime);
    }
  }

  async fetch() {
    // Deduplication: nếu đang có request đang bay, trả về Promise đó thay vì gọi 2 lần
    if (this.activePromise) {
      return this.activePromise;
    }

    this.state = {
      ...this.state,
      isFetching: true
    };
    this.notify();

    this.activePromise = (async () => {
      try {
        const data = await this.queryFn({ queryKey: this.queryKey });
        this.state = {
          data,
          error: null,
          status: 'success',
          isFetching: false,
          dataUpdatedAt: Date.now(),
          errorUpdatedAt: 0
        };
        this.notify();
        return data;
      } catch (err) {
        this.state = {
          ...this.state,
          error: err,
          status: 'error',
          isFetching: false,
          errorUpdatedAt: Date.now()
        };
        this.notify();
        throw err;
      } finally {
        this.activePromise = null;
      }
    })();

    return this.activePromise;
  }

  setData(updater) {
    const prevData = this.state.data;
    const nextData = typeof updater === 'function' ? updater(prevData) : updater;
    this.state = {
      ...this.state,
      data: nextData,
      status: 'success',
      dataUpdatedAt: Date.now()
    };
    this.notify();
    return nextData;
  }
}

/**
 * QueryClient: Trung tâm điều phối Cache, Query, Mutation và Invalidation
 */
export class QueryClient {
  constructor(config = {}) {
    this.queries = new Map(); // queryHash -> Query
    this.defaultOptions = {
      queries: {
        staleTime: config.defaultOptions?.queries?.staleTime ?? 10000, // 10s
        gcTime: config.defaultOptions?.queries?.gcTime ?? 300000
      }
    };
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(l => l(this.getCacheSnapshot()));
  }

  getQuery(queryKey) {
    const hash = hashQueryKey(queryKey);
    return this.queries.get(hash);
  }

  buildQuery(options) {
    const hash = hashQueryKey(options.queryKey);
    let query = this.queries.get(hash);
    if (!query) {
      query = new Query({
        ...options,
        staleTime: options.staleTime ?? this.defaultOptions.queries.staleTime,
        gcTime: options.gcTime ?? this.defaultOptions.queries.gcTime
      });
      query.client = this;
      this.queries.set(hash, query);
      this.notifyListeners();
    } else {
      // Cập nhật queryFn mới nhất nếu có
      if (options.queryFn) query.queryFn = options.queryFn;
      if (options.staleTime !== undefined) query.staleTime = options.staleTime;
    }
    return query;
  }

  removeQuery(queryHash) {
    this.queries.delete(queryHash);
    this.notifyListeners();
  }

  getQueryData(queryKey) {
    return this.getQuery(queryKey)?.state.data;
  }

  setQueryData(queryKey, updater) {
    const query = this.buildQuery({ queryKey });
    const result = query.setData(updater);
    this.notifyListeners();
    return result;
  }

  /**
   * Invalidate Queries: Đánh dấu queries tương ứng là Stale và kích hoạt fetch lại
   */
  async invalidateQueries(filters = {}) {
    const targetHash = filters.queryKey ? hashQueryKey(filters.queryKey) : null;
    const prefix = Array.isArray(filters.queryKey) ? JSON.stringify(filters.queryKey[0]).slice(0, -1) : null;

    const promises = [];
    this.queries.forEach((query, hash) => {
      let shouldInvalidate = false;

      if (!targetHash) {
        shouldInvalidate = true;
      } else if (filters.exact) {
        shouldInvalidate = hash === targetHash;
      } else {
        // Khớp prefix: ví dụ ['products'] khớp ['products', { page: 1 }]
        shouldInvalidate = hash.startsWith(prefix || targetHash);
      }

      if (shouldInvalidate) {
        // Đánh dấu thời gian đã lỗi thời
        query.state.dataUpdatedAt = 0;
        // Nếu có subscriber đang lắng nghe, tự động fetch lại
        if (query.subscribers.size > 0) {
          promises.push(query.fetch());
        }
      }
    });

    this.notifyListeners();
    await Promise.all(promises);
  }

  /**
   * Prefetch Query: Tải trước ngầm vào cache để chuyển trang tức thì
   */
  async prefetchQuery(options) {
    const query = this.buildQuery(options);
    if (query.isStale() || query.state.status === 'pending') {
      await query.fetch();
      this.notifyListeners();
    }
    return query.state.data;
  }

  getCacheSnapshot() {
    const snapshot = [];
    this.queries.forEach((q, hash) => {
      snapshot.push({
        hash,
        queryKey: q.queryKey,
        status: q.state.status,
        isFetching: q.state.isFetching,
        isStale: q.isStale(),
        subscribersCount: q.subscribers.size,
        dataUpdatedAt: q.state.dataUpdatedAt,
        itemCount: Array.isArray(q.state.data) ? q.state.data.length : (q.state.data ? 1 : 0)
      });
    });
    return snapshot;
  }
}

// Global default QueryClient Instance
export const queryClient = new QueryClient();

// ============================================================================
// REACT HOOK SIMULATORS: useQuery & useMutation
// ============================================================================

/**
 * useQuery Simulator
 */
export function createQueryObserver(client, options) {
  const query = client.buildQuery(options);

  return {
    getCurrentResult: () => ({
      data: query.state.data !== undefined ? query.state.data : options.placeholderData,
      error: query.state.error,
      isLoading: query.state.status === 'pending' && query.state.isFetching,
      isPending: query.state.status === 'pending',
      isFetching: query.state.isFetching,
      isSuccess: query.state.status === 'success',
      isError: query.state.status === 'error',
      isStale: query.isStale(),
      refetch: () => query.fetch()
    }),
    subscribe: (onStoreChange) => {
      // 1. Đăng ký lắng nghe thay đổi
      const unsubscribe = query.subscribe(() => {
        onStoreChange();
        client.notifyListeners();
      });

      // 2. Tự động fetch nếu data chưa có hoặc đã stale
      if (options.enabled !== false && (query.isStale() || query.state.status === 'pending')) {
        query.fetch().catch(() => {});
      }

      return unsubscribe;
    }
  };
}

/**
 * useMutation Simulator hỗ trợ Optimistic Updates
 */
export function createMutation(client, options) {
  let state = {
    data: undefined,
    error: null,
    isPending: false,
    isSuccess: false,
    isError: false
  };

  const listeners = new Set();
  const notify = () => listeners.forEach(l => l(state));

  const mutate = async (variables) => {
    state = { ...state, isPending: true, isError: false, error: null };
    notify();

    let context = undefined;
    // 1. Chạy onMutate (Thực hiện Optimistic Update)
    if (options.onMutate) {
      try {
        context = await options.onMutate(variables);
      } catch (err) {
        console.warn('[Mutation onMutate Warning]:', err);
      }
    }

    try {
      // 2. Gọi Mutation Function lên Server
      const result = await options.mutationFn(variables);
      state = {
        data: result,
        error: null,
        isPending: false,
        isSuccess: true,
        isError: false
      };
      notify();

      if (options.onSuccess) {
        await options.onSuccess(result, variables, context);
      }
      if (options.onSettled) {
        await options.onSettled(result, null, variables, context);
      }
      return result;
    } catch (error) {
      state = {
        data: undefined,
        error,
        isPending: false,
        isSuccess: false,
        isError: true
      };
      notify();

      // 3. Rollback nếu có lỗi (Dùng snapshot từ context)
      if (options.onError) {
        await options.onError(error, variables, context);
      }
      if (options.onSettled) {
        await options.onSettled(undefined, error, variables, context);
      }
      throw error;
    }
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    mutate
  };
}
