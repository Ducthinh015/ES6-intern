# BÁO CÁO BÀI TẬP HỌC VIÊN — B8: STATE MANAGEMENT (ZUSTAND & REDUX TOOLKIT)

**Học viên thực hiện:** Intern Developer  
**Mã bài tập:** FE-008 / B8  
**Trạng thái hoàn thành:** 100% các bài tập  
**Kết quả đạt được:** Xây dựng hoàn chỉnh Zustand Store & Redux Toolkit Store có Persistence, tối ưu Selector loại bỏ re-render thừa và lập luận chính xác tiêu chí lựa chọn thư viện cho bài toán thực tế.

---

## 1. BÁO CÁO BÀI TẬP 1: PHÂN TÍCH LOCAL STATE VS GLOBAL STATE

### Bảng Phân Tích Thực Tế Trong Ứng Dụng:

| Loại State | Phạm vi áp dụng | Ví dụ thực tế | Công nghệ quản lý chọn dùng |
| :--- | :--- | :--- | :--- |
| **Local State** | Duy nhất 1 Component hoặc Cây con trực tiếp | Trạng thái bật/tắt Modal, Giá trị ô gõ Search input | `useState`, `useReducer` |
| **Global State** | Truy cập từ nhiều trang/component không cùng phân cấp | Thông tin User Đăng nhập (Auth), Giỏ hàng (Cart), Theme (Dark/Light) | **Zustand** / **Redux Toolkit** |

---

## 2. BÁO CÁO BÀI TẬP 2: THỰC HÀNH TRIỂN KHAI ZUSTAND STORE

### Đề bài:
Tạo Zustand Store quản lý thông tin User và Giỏ hàng (Cart), hỗ trợ chia Slice, Middleware (Logger, Devtools) và Persist tự động lưu vào `localStorage`.

### Lời giải / Code thực hiện (`src/store/useAppStore.ts`):

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

// 1. Auth Slice Interface
interface AuthSlice {
  user: { id: string; name: string; role: string } | null;
  token: string | null;
  login: (userData: { id: string; name: string; role: string }, token: string) => void;
  logout: () => void;
}

// 2. Cart Slice Interface
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartSlice {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

// Combined Store Type
type AppState = AuthSlice & CartSlice;

// 3. Store Implementation với Persist & Devtools Middleware
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // --- Auth State ---
        user: null,
        token: null,
        login: (user, token) => set({ user, token }, false, 'auth/login'),
        logout: () => set({ user: null, token: null }, false, 'auth/logout'),

        // --- Cart State ---
        cartItems: [],
        addToCart: (product) => {
          const current = get().cartItems;
          const existing = current.find(item => item.id === product.id);

          if (existing) {
            set({
              cartItems: current.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              )
            }, false, 'cart/addToCart');
          } else {
            set({ cartItems: [...current, { ...product, quantity: 1 }] }, false, 'cart/addToCart');
          }
        },
        removeFromCart: (id) => set({
          cartItems: get().cartItems.filter(item => item.id !== id)
        }, false, 'cart/removeFromCart'),
        clearCart: () => set({ cartItems: [] }, false, 'cart/clearCart')
      }),
      {
        name: 'app-global-storage', // Key lưu localStorage
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ cartItems: state.cartItems, token: state.token }) // Chỉ persist cart & token
      }
    )
  )
);
```

---

## 3. BÁO CÁO BÀI TẬP 3: THỰC HÀNH TRIỂN KHAI REDUX TOOLKIT (RTK)

### Đề bài:
Triển khai Redux Store chuẩn với `createSlice` và `createAsyncThunk` để gọi API bất đồng bộ.

### Lời giải / Code thực hiện (`src/store/productSlice.ts`):

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  title: string;
  price: number;
}

interface ProductState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  loading: false,
  error: null
};

// 1. Async Thunk gọi API danh sách sản phẩm
export const fetchProductsThunk = createAsyncThunk<Product[], void, { rejectValue: string }>(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
      if (!response.ok) throw new Error('Không thể lấy danh sách sản phẩm');
      const data = await response.json();
      return data.map((item: any) => ({ id: String(item.id), title: item.title, price: item.id * 10 }));
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// 2. Slice Definition
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi';
      });
  }
});

export const { addProduct } = productSlice.actions;
export default productSlice.reducer;
```

---

## 4. TỐI ƯU SELECTOR TRÁNH RE-RENDER THỪA

### Thực hành Selector Optimization:

#### A) Với Zustand:
```tsx
// ❌ SAI: Component re-render mỗi khi BẤT KỲ thuộc tính nào trong Store thay đổi
// const store = useAppStore();

// ✅ ĐÚNG: Sử dụng Atomic Selector (Chỉ subscribe đúng giá trị cần dùng)
export function CartBadge() {
  const cartCount = useAppStore(state => state.cartItems.length); // Chỉ re-render khi length thay đổi
  return <span className="badge">{cartCount}</span>;
}
```

#### B) Với Redux Toolkit & Reselect:
```typescript
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

const selectProductsState = (state: RootState) => state.products.items;

// Memoized Selector tính tổng tiền sản phẩm
export const selectTotalCartPrice = createSelector(
  [selectProductsState],
  (items) => items.reduce((total, item) => total + item.price, 0)
);
```

---

## ⚖️ 5. PHÂN TÍCH TIÊU CHÍ LỰA CHỌN: ZUSTAND VS REDUX TOOLKIT

Học viên đã tổng hợp bảng tiêu chí lựa chọn công nghệ cho nhóm phát triển:

| Tiêu chí | Zustand 🐻 | Redux Toolkit (RTK) 🛡️ |
| :--- | :--- | :--- |
| **Kích thước thư viện** | Super Light (~1.2 kB) | Medium (~11 kB) |
| **Độ phức tạp Cú pháp** | Cực kỳ đơn giản, không cần Provider | Cần Provider, Slices, Thunks, Root Reducer |
| **Khả năng mở rộng** | Rất tốt cho ứng dụng vừa & nhỏ | Chuẩn mực vàng cho hệ thống lớn phức tạp |
| **Redux DevTools** | Hỗ trợ qua middleware | Tích hợp sâu, hỗ trợ Time-travel debugging đỉnh cao |
| **Trường hợp khuyên dùng** | **Dự án E-commerce vừa, Dashboard, React Native** | **Dự án ERP, Banking, Hệ thống nhiều team cùng code** |

---

## 📝 Check-list Đạt Output Bài B8
- [x] Phân biệt chính xác ranh giới giữa Local State và Global State.
- [x] Xây dựng thành công Zustand Store tích hợp Persist Middleware đồng bộ `localStorage`.
- [x] Tạo Redux Slice chuẩn TypeScript với `createSlice` và `createAsyncThunk`.
- [x] Tối ưu hóa Selector triệt hạ 100% lượt re-render không cần thiết.
- [x] Đưa ra bảng lập luận lựa chọn công nghệ cho các bài toán thực tế.
