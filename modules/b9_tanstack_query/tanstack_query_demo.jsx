// ============================================================================
// B9 / DEV-FE-009: REAL-WORLD REACT TANSTACK QUERY v5 COMPONENT DEMO
// QueryKey Factories, Custom Query Hooks, Mutations with Optimistic Updates, Pagination
// ============================================================================

import React, { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData
} from '@tanstack/react-query';

/**
 * 1. Query Key Factory Pattern: Chuẩn hóa toàn bộ Query Keys trong dự án
 * Giúp tránh sai sót gõ string ad-hoc và hỗ trợ invalidation theo cụm
 */
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id]
};

/**
 * 2. API Service Mock
 */
export const mockApi = {
  fetchProducts: async ({ page = 1, limit = 5, search = '' }) => {
    // Giả lập network latency 400ms
    await new Promise(r => setTimeout(r, 400));

    const allData = [
      { id: 1, title: 'Bàn phím cơ Custom Keychron Q1 Pro', price: 210, inStock: true },
      { id: 2, title: 'Màn hình LG DualUp 28 inch 16:18', price: 680, inStock: true },
      { id: 3, title: 'Tai nghe Sony WH-1000XM5 Chống ồn', price: 340, inStock: false },
      { id: 4, title: 'Ghế công thái học Ergonomic Herman Miller', price: 1450, inStock: true },
      { id: 5, title: 'Chuột không dây Logitech MX Anywhere 3S', price: 85, inStock: true },
      { id: 6, title: 'Đèn bàn thông minh BenQ ScreenBar Halo', price: 180, inStock: true },
      { id: 7, title: 'Loa để bàn Audioengine A2+ Wireless', price: 270, inStock: true },
      { id: 8, title: 'Hub chuyển đổi CalDigit TS4 Thunderbolt 4', price: 399, inStock: true }
    ];

    const filtered = allData.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );

    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return {
      items,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1,
      currentPage: page
    };
  },

  createProduct: async (newProduct) => {
    await new Promise(r => setTimeout(r, 500));
    // Giả lập 10% xác suất lỗi nếu tiêu đề có từ 'fail'
    if (newProduct.title.toLowerCase().includes('fail')) {
      throw new Error('Lỗi máy chủ: Không thể tạo sản phẩm này!');
    }
    return {
      id: Date.now(),
      ...newProduct
    };
  }
};

/**
 * 3. Custom Query Hook: useProductsQuery
 */
export function useProductsQuery({ page, search }) {
  return useQuery({
    queryKey: productKeys.list({ page, search }),
    queryFn: () => mockApi.fetchProducts({ page, search }),
    staleTime: 10000, // Dữ liệu được coi là mới trong 10 giây (không fetch lại thừa)
    gcTime: 5 * 60 * 1000, // Lưu trong cache 5 phút
    placeholderData: keepPreviousData // Giữ dữ liệu trang cũ khi chuyển trang -> Không bị giật UI!
  });
}

/**
 * 4. Custom Mutation Hook: useCreateProductMutation với Optimistic Updates
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockApi.createProduct,

    // KHI BẮT ĐẦU MUTATE: Cập nhật lạc quan (Optimistic Update)
    onMutate: async (newProduct) => {
      // 1. Cancel các queries đang chạy để tránh ghi đè dữ liệu lạc quan
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });

      // 2. Snapshot giá trị cache hiện tại để rollback nếu phát sinh lỗi
      const previousData = queryClient.getQueryData(productKeys.lists());

      // 3. Cập nhật cache tức thì với dữ liệu giả lập (Optimistic)
      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old) => {
        if (!old) return old;
        const optimisticItem = { id: `temp-${Date.now()}`, ...newProduct };
        return {
          ...old,
          items: [optimisticItem, ...old.items],
          totalCount: old.totalCount + 1
        };
      });

      // 4. Trả về context chứa snapshot
      return { previousData };
    },

    // NẾU XẢY RA LỖI: Rollback lại trạng thái ban đầu
    onError: (err, newProduct, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: productKeys.lists() }, context.previousData);
      }
      alert(`⚠️ Lỗi tạo sản phẩm: ${err.message}. Đã rollback giao diện tự động!`);
    },

    // KHI HOÀN TẤT (Thành công hay thất bại): Invalidate để đồng bộ chuẩn xác với DB
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    }
  });
}

/**
 * 5. Main Component: TanStackQueryDashboard
 */
export function TanStackQueryDashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState(100);

  // Queries & Mutations
  const { data, isLoading, isFetching, isError, error, refetch } = useProductsQuery({ page, search });
  const createMutation = useCreateProductMutation();

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createMutation.mutate({
      title: newTitle,
      price: Number(newPrice),
      inStock: true
    }, {
      onSuccess: () => {
        setNewTitle('');
        setNewPrice(100);
      }
    });
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl border border-indigo-500/20 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">DEV-FE-009 / B9 DEMO</span>
          <h2 className="text-2xl font-bold">TanStack Query v5 Dashboard</h2>
          <p className="text-xs text-slate-400">Server State Management với Cache, Invalidation, Stale-Time & Optimistic UI</p>
        </div>

        <div className="flex items-center gap-3">
          {isFetching && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Background Syncing...
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            Refetch Dữ liệu
          </button>
        </div>
      </div>

      {/* Form Tạo Sản Phẩm Lạc Quan (Optimistic Mutation) */}
      <form onSubmit={handleAddProduct} className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-400 mb-1">Tên sản phẩm (Gõ 'fail' để test rollback tự động):</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ví dụ: Màn hình Dell..."
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="w-32">
          <label className="block text-xs text-slate-400 mb-1">Giá ($):</label>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          {createMutation.isPending ? 'Đang gửi...' : '+ Thêm (Optimistic UI)'}
        </button>
      </form>

      {/* Danh Sách Sản Phẩm */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white w-64 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-xs text-slate-400">
            Tổng cộng: <strong className="text-white">{data?.totalCount ?? 0}</strong> sản phẩm
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Đang tải dữ liệu ban đầu từ máy chủ...</div>
        ) : isError ? (
          <div className="p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm">
            Lỗi nạp dữ liệu: {error?.message}
          </div>
        ) : (
          <div className="grid gap-2">
            {data?.items.map((product) => (
              <div
                key={product.id}
                className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                  String(product.id).startsWith('temp-')
                    ? 'bg-indigo-950/40 border-indigo-500/50 opacity-80'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                    {product.title}
                    {String(product.id).startsWith('temp-') && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded border border-indigo-400/40">
                        ⚡ Optimistic (Đang đồng bộ)
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-slate-400">${product.price}</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                  product.inStock ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-700 text-slate-400'
                }`}>
                  {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Phân Trang (Pagination) */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-slate-800 disabled:opacity-30 text-xs rounded border border-slate-700"
          >
            ← Trang trước
          </button>
          <span className="text-xs text-slate-400">
            Trang <strong className="text-indigo-400">{page}</strong> / {data?.totalPages || 1}
          </span>
          <button
            onClick={() => setPage(p => (data?.totalPages && p < data.totalPages ? p + 1 : p))}
            disabled={!data || page >= data.totalPages}
            className="px-3 py-1 bg-slate-800 disabled:opacity-30 text-xs rounded border border-slate-700"
          >
            Trang tiếp →
          </button>
        </div>
      </div>
    </div>
  );
}
