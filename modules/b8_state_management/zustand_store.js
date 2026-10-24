// ============================================================================
// B8 / DEV-FE-008: ZUSTAND STATE MANAGEMENT IMPLEMENTATION & PATTERNS
// Store Slices, Persistence Middleware (localStorage), DevTools & Atomic Selectors
// ============================================================================

/**
 * Lightweight Zustand Store Core implementation with Middleware support
 * Mô phỏng chính xác kiến trúc create() từ thư viện 'zustand'
 */
export function createStore(initializer) {
  let state;
  const listeners = new Set();

  const getState = () => state;

  const setState = (partial, replace = false, actionName = 'anonymous') => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = replace ? nextState : Object.assign({}, state, nextState);
      listeners.forEach(listener => listener(state, previousState));
    }
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy = () => {
    listeners.clear();
  };

  const api = { getState, setState, subscribe, destroy };
  state = initializer(setState, getState, api);
  return api;
}

/**
 * Persist Middleware: Tự động đồng bộ Store xuống Storage (localStorage)
 * Hỗ trợ partialize (chỉ lưu những field cần thiết)
 */
export function persist(initializer, options) {
  const { name, storage = typeof localStorage !== 'undefined' ? localStorage : null, partialize } = options;

  return (set, get, api) => {
    // 1. Tải trạng thái đã lưu trước đó nếu có
    let savedState = {};
    if (storage) {
      try {
        const raw = storage.getItem(name);
        if (raw) {
          savedState = JSON.parse(raw);
        }
      } catch (err) {
        console.warn(`[Zustand Persist] Không thể đọc localStorage key "${name}":`, err);
      }
    }

    // 2. Khởi tạo state ban đầu kết hợp với dữ liệu đã lưu
    const initialState = initializer(
      (...args) => {
        set(...args);
        // Lưu sau mỗi lần state thay đổi
        if (storage) {
          try {
            const currentState = get();
            const toSave = partialize ? partialize(currentState) : currentState;
            storage.setItem(name, JSON.stringify(toSave));
          } catch (err) {
            console.error(`[Zustand Persist] Lỗi ghi localStorage key "${name}":`, err);
          }
        }
      },
      get,
      api
    );

    return { ...initialState, ...savedState };
  };
}

/**
 * Devtools & Logging Middleware
 */
export function devtools(initializer, options = { name: 'AppStore' }) {
  return (set, get, api) => {
    return initializer(
      (partial, replace, actionName = 'action') => {
        const prevState = get();
        set(partial, replace);
        const nextState = get();
        if (typeof console !== 'undefined' && console.groupCollapsed) {
          console.groupCollapsed(`%c[Zustand ${options.name}] ${actionName}`, 'color: #6366f1; font-weight: bold;');
          console.log('%cPrev State:', 'color: #94a3b8;', prevState);
          console.log('%cNext State:', 'color: #10b981; font-weight: bold;', nextState);
          console.groupEnd();
        }
      },
      get,
      api
    );
  };
}

// ============================================================================
// SLICE DEFINITIONS (Mô hình Slice Pattern chuyên nghiệp)
// ============================================================================

/**
 * 1. Auth Slice: Quản lý thông tin đăng nhập và Token
 */
export const createAuthSlice = (set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (userData, authToken) => {
    set(
      {
        user: userData,
        token: authToken,
        isAuthenticated: true
      },
      false,
      'auth/login'
    );
  },

  logout: () => {
    set(
      {
        user: null,
        token: null,
        isAuthenticated: false
      },
      false,
      'auth/logout'
    );
  },

  updateUserProfile: (profileUpdates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    set(
      {
        user: { ...currentUser, ...profileUpdates }
      },
      false,
      'auth/updateUserProfile'
    );
  }
});

/**
 * 2. Cart Slice: Quản lý giỏ hàng sản phẩm
 */
export const createCartSlice = (set, get) => ({
  cartItems: [],

  addToCart: (product) => {
    const currentItems = get().cartItems;
    const existingIndex = currentItems.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      const updated = currentItems.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      );
      set({ cartItems: updated }, false, 'cart/addToCart_Increment');
    } else {
      const newItem = { ...product, quantity: product.quantity || 1 };
      set({ cartItems: [...currentItems, newItem] }, false, 'cart/addToCart_New');
    }
  },

  removeFromCart: (productId) => {
    const filtered = get().cartItems.filter(item => item.id !== productId);
    set({ cartItems: filtered }, false, 'cart/removeFromCart');
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const updated = get().cartItems.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    set({ cartItems: updated }, false, 'cart/updateQuantity');
  },

  clearCart: () => {
    set({ cartItems: [] }, false, 'cart/clearCart');
  },

  // Computed / Selectors getters
  getCartTotalCount: () => {
    return get().cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  getCartTotalPrice: () => {
    return get().cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  }
});

// ============================================================================
// KHỞI TẠO STORE TOÀN CỤC KẾT HỢP MIDDLEWARE VÀ SLICES
// ============================================================================

export const useAppStore = createStore(
  devtools(
    persist(
      (set, get, api) => ({
        ...createAuthSlice(set, get, api),
        ...createCartSlice(set, get, api)
      }),
      {
        name: 'app-global-storage',
        partialize: (state) => ({
          cartItems: state.cartItems,
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    { name: 'GlobalAppStore' }
  )
);

/**
 * Atomic Selector Hook Helper
 * Chỉ re-render khi giá trị được chọn thực sự thay đổi
 */
export function useStoreSelector(selector = state => state, equalityFn = Object.is) {
  let currentValue = selector(useAppStore.getState());
  
  return {
    get: () => selector(useAppStore.getState()),
    subscribe: (callback) => {
      return useAppStore.subscribe((state) => {
        const nextValue = selector(state);
        if (!equalityFn(currentValue, nextValue)) {
          currentValue = nextValue;
          callback(nextValue);
        }
      });
    }
  };
}
