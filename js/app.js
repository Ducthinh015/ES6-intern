import { createCounter } from './closure.js';
import { users, getUsersView, totalAge } from './array-methods.js';
import { runSequentialDemo, runParallelDemo } from './async.js';
import { playEventLoopDemo } from './event-loop.js';
import { useAppStore } from '../modules/b8_state_management/zustand_store.js';
import { reduxStore, fetchProductsThunk } from '../modules/b8_state_management/redux_toolkit_store.js';
import { queryClient } from '../modules/b9_tanstack_query/tanstack_query_engine.js';
import {
  nextAuthMiddleware,
  simulateNextRenderingStrategy,
  executeServerAction
} from '../modules/b10_nextjs_typescript/nextjs_router_engine.js';
import {
  evaluatePasswordStrength,
  validateLoginSchema,
  validateRegisterSchema,
  CUSTOM_POLICY_CLAUSES,
  registerNewUserAccount,
  authenticateUserAccount,
  getDemoCredentials
} from '../modules/b11_form_handling/form_validator_engine.js';

// ============================================================================
// 1. ROADMAP TASKS (B1 — B11: 18 CHẶNG)
// ============================================================================

const tasks = [
  'Scope, let/const, hoisting & closure',
  'Function, arrow function & this',
  'map / filter / reduce / find / some / every',
  'Destructuring, spread/rest, ?. và ??',
  'Promise + async/await + try/catch',
  'Fetch tuần tự vs Promise.all',
  'Event Loop: stack / microtask / task',
  'ES Modules: import / export',
  'Prototype & class / extends',
  'JS Core assessment + Q&A mentor',
  'B4: React Fundamentals (JSX, Props, State, Form, Lifecycle)',
  'B5: Tổng quan Module nội bộ (Architecture, Routing→Data→Render)',
  'B6: TypeScript Integration (Types, Generics, Strict Coverage >90%)',
  'B7: React Advanced Performance (Memoization, Custom Hooks)',
  'B8: State Management (Zustand, Redux Toolkit, Persist)',
  'B9: Fetching với TanStack Query (Server State, Caching, Optimistic Updates)',
  'B10: Next.js App Router + TypeScript (RSC, SSR/SSG/ISR, Middleware Auth Guard)',
  'B11: Form Handling (React Hook Form, Zod Schema, Policy Checkbox & Modal)'
];

let completed = tasks.map((_, idx) => idx >= 10); // Mặc định đánh dấu hoàn thành các bài tập B4-B11

function renderTasks() {
  const list = document.querySelector('#task-list');
  if (!list) return;
  list.innerHTML = '';

  tasks.forEach((task, index) => {
    const row = document.createElement('label');
    row.className =
      'task flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 mb-1';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mr-3';
    checkbox.checked = completed[index];
    checkbox.addEventListener('change', () => {
      completed[index] = checkbox.checked;
      updateProgress();
    });

    const text = document.createElement('div');
    text.className = 'flex-1';
    const group =
      index < 4
        ? 'JS Nền tảng'
        : index < 10
        ? 'JS Bất đồng bộ & Core'
        : index < 12
        ? 'React & Module Nội bộ (B4-B5)'
        : index < 16
        ? 'TS, Performance, State & Query (B6-B9)'
        : 'Next.js + TS & Form Handling (B10-B11)';
    text.innerHTML = `<strong class="block text-sm font-semibold text-slate-800 dark:text-slate-200">${String(
      index + 1
    ).padStart(2, '0')}. ${task}</strong><small class="text-xs text-slate-400">${group}</small>`;

    row.append(checkbox, text);
    list.append(row);
  });
}

function updateProgress() {
  const done = completed.filter(Boolean).length;
  const percent = Math.round((done / completed.length) * 100);
  const label = document.querySelector('#progress-label');
  const bar = document.querySelector('#progress-bar');
  const copy = document.querySelector('#progress-copy');

  if (label) label.textContent = `${percent}%`;
  if (bar) bar.style.width = `${percent}%`;
  if (copy) {
    copy.textContent =
      done === completed.length
        ? '🎉 Hoàn thành toàn bộ lộ trình khóa học FE (B1 - B11)!'
        : done >= 8
        ? 'Đã mở khóa các module B4-B9 cùng Next.js + TS (B10) & Form Handling (B11)!'
        : 'Bắt đầu học từ nền tảng Scope & Closure.';
  }
}

document.querySelector('#reset-btn')?.addEventListener('click', () => {
  completed = completed.map(() => false);
  renderTasks();
  updateProgress();
});

// ============================================================================
// 2. INTERACTIVE LABS B1 — B3
// ============================================================================

const inc = createCounter();
document.querySelector('#counter-btn')?.addEventListener('click', () => {
  const val = document.querySelector('#counter-value');
  if (val) val.textContent = inc();
});

function renderUsers(mode = 'all') {
  const view = document.querySelector('#users-view');
  if (!view) return;
  const data = getUsersView(mode);

  view.innerHTML = data
    .map(item => {
      if (typeof item === 'string') {
        return `<div class="user p-2 bg-slate-100 dark:bg-slate-800 rounded font-medium text-xs"><strong>${item}</strong></div>`;
      }
      return `<div class="user p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs"><strong>${item.name}</strong><span class="block text-slate-400">${item.age} tuổi · ${
        item.active ? 'active' : 'inactive'
      }</span></div>`;
    })
    .join('');
}

document.querySelector('#array-actions')?.addEventListener('click', event => {
  const button = event.target.closest('button[data-mode]');
  if (button) renderUsers(button.dataset.mode);
});

const ageEl = document.querySelector('#age-total');
if (ageEl) ageEl.textContent = totalAge(users);

document.querySelector('#event-btn')?.addEventListener('click', async () => {
  const btn = document.querySelector('#event-btn');
  if (!btn) return;
  btn.disabled = true;
  await playEventLoopDemo(value => {
    const output = document.querySelector('#event-output');
    if (output) output.textContent = value;
  });
  btn.disabled = false;
});

document.querySelector('#seq-btn')?.addEventListener('click', async () => {
  const ms = await runSequentialDemo();
  const seqTime = document.querySelector('#seq-time');
  const note = document.querySelector('#async-note');
  if (seqTime) seqTime.textContent = `${(ms / 1000).toFixed(1)}s`;
  if (note) note.textContent = 'Tuần tự: tác vụ B chờ A hoàn thành rồi mới chạy.';
});

document.querySelector('#par-btn')?.addEventListener('click', async () => {
  const ms = await runParallelDemo();
  const parTime = document.querySelector('#par-time');
  const note = document.querySelector('#async-note');
  if (parTime) parTime.textContent = `${(ms / 1000).toFixed(1)}s`;
  if (note) note.textContent = 'Promise.all: hai tác vụ độc lập chạy đồng thời.';
});

// ============================================================================
// 3. LESSONS DATA (B4 — B9 HIỆN TẠI + B10 NEXT.JS & B11 FORM HANDLING)
// ============================================================================

const lessonsData = {
  B4: {
    badge: 'Bài tập 4 (Hiện tại)',
    shortTitle: 'React Fundamentals',
    title: 'B4: React Fundamentals',
    docPath: 'docs/B4_React_Fundamentals.md',
    summary:
      'Nắm vững tư duy Component, JSX, Props, State, useState & useEffect, Render Danh Sách & Keys, Controlled Inputs và Cơ chế Re-render.',
    topics: [
      'JSX & Component Architecture',
      'Props & State (Unidirectional Data Flow)',
      'useState & 3 dạng useEffect (Mount, Deps, Cleanup)',
      'Controlled Form Inputs & Lifting State Up',
      'Virtual DOM Diffing & Lifecycle'
    ],
    codeSnippet: `// Controlled Input + useState
const [form, setForm] = useState({ username: '', email: '' });

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};`,
    demoAction: 'Simulate React State Update',
    demoHandler: () => {
      alert('⚡ [B4 React Fundamentals]: Component State updated! Re-render triggered with Virtual DOM reconciliation.');
    }
  },
  B5: {
    badge: 'Bài tập 5 (Hiện tại)',
    shortTitle: 'Module Nội Bộ',
    title: 'B5: Tổng Quan Module Nội Bộ (Lark Wiki)',
    docPath: 'docs/B5_Internal_Module_Overview.md',
    summary:
      'Chạy project local, Cấu trúc thư mục chuẩn doanh nghiệp (Feature-first), Luồng dữ liệu (Routing → Data → Render) và Mentor Q&A.',
    topics: [
      'Tech stack & dependency matrix',
      'Local Dev setup (npm run dev & env config)',
      'Cấu trúc thư mục Feature-first & Shared Components',
      'Routing → Data Fetching (Axios Interceptors) → UI Render',
      'Mentor Q&A & Code search strategies'
    ],
    codeSnippet: `// Pipeline: Routing -> Data Fetching -> Render
const router = new FlowRouterSimulator(routes);
router.navigate('/users'); 
// Interceptor automatically attaches Bearer JWT Token!`,
    demoAction: 'Run Internal Flow Simulator',
    demoHandler: () => {
      alert('🚀 [B5 Internal Module]: Navigated to /users -> Interceptor attached JWT Token -> Rendered <UserManagementPage />');
    }
  },
  B6: {
    badge: 'Bài tập 6 (Hiện tại)',
    shortTitle: 'TypeScript Integration',
    title: 'B6: TypeScript Integration',
    docPath: 'docs/B6_TypeScript_Integration.md',
    summary:
      'Định kiểu Props/State/Event trong React, Type Narrowing, Generics, loại bỏ `any` bằng `unknown` và đạt Type Coverage > 90%.',
    topics: [
      'Type vs Interface & Union/Literal types',
      'Định kiểu React Props, State & Event handlers',
      'Type narrowing (typeof, in, custom guards)',
      'Generics & Standard Utility Types (Pick, Omit, Record)',
      'TS Strict mode & Type coverage > 90%'
    ],
    codeSnippet: `// Type Guard avoiding any
function isUserProfile(obj: unknown): obj is UserProfile {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}`,
    demoAction: 'Run TypeScript Guard Check',
    demoHandler: () => {
      alert('✅ [B6 TypeScript]: Type Guard Verified! Data is safe and strongly typed with >90% Type Coverage.');
    }
  },
  B7: {
    badge: 'Bài tập 7 (Hiện tại)',
    shortTitle: 'React Performance',
    title: 'B7: React Advanced Performance & Custom Hooks',
    docPath: 'docs/B7_React_Advanced_Performance.md',
    summary:
      'Tối ưu hóa render với useMemo, useCallback, React.memo, viết Custom Hooks đóng gói logic và dùng React Profiler.',
    topics: [
      'useRef vs useState (lưu dữ liệu không trigger re-render)',
      'useMemo & useCallback (memoization đúng cách)',
      'React.memo ngăn ngừa child component re-renders',
      'Viết Custom Hooks (useFetch, useDebounce, useLocalStorage)',
      'React DevTools Profiler & Flamegraph analysis'
    ],
    codeSnippet: `// Custom Hook: useDebounce
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}`,
    demoAction: 'Run Performance Memoization Check',
    demoHandler: () => {
      alert('⚡ [B7 Performance]: Memoization Check Passed! Child component skipped unnecessary re-render using React.memo.');
    }
  },
  B8: {
    badge: 'Bài tập 8 (Hiện tại)',
    shortTitle: 'State Management',
    title: 'B8: State Management (Zustand & Redux Toolkit)',
    docPath: 'docs/B8_State_Management.md',
    summary:
      'Quản lý Global State với Zustand (Slices, Middleware Persist localStorage, Devtools) và Redux Toolkit (Slices, createAsyncThunk, Reselect).',
    topics: [
      'Phân biệt Local State (UI) vs Global State (Shared)',
      'Zustand: Slice pattern & Middleware Persist localStorage',
      'Redux Toolkit: configureStore, createSlice & createAsyncThunk',
      'Tối ưu Atomic Selectors (Zustand) & Reselect (RTK) tránh re-render',
      'Bảng tiêu chí lựa chọn công nghệ cho dự án doanh nghiệp'
    ],
    codeSnippet: `// Zustand Store with Slices & Persist
export const useAppStore = createStore(
  devtools(
    persist(
      (set, get, api) => ({
        ...createAuthSlice(set, get, api),
        ...createCartSlice(set, get, api)
      }),
      { name: 'app-global-storage' }
    )
  )
);`,
    demoAction: 'Dispatch Zustand & RTK Actions',
    demoHandler: async () => {
      useAppStore.getState().addToCart({
        id: 'prod_' + Math.floor(Math.random() * 1000),
        name: 'Sản phẩm demo ' + (useAppStore.getState().cartItems.length + 1),
        price: 99
      });
      const cartCount = useAppStore.getState().getCartTotalCount();
      const totalPrice = useAppStore.getState().getCartTotalPrice();

      await reduxStore.dispatch(fetchProductsThunk(2));
      const rtkProducts = reduxStore.getState().products.items.length;

      alert(`✅ [B8 State Management Test]:
• Zustand Cart: ${cartCount} sản phẩm (Tổng: $${totalPrice}) -> Đã đồng bộ localStorage!
• Zustand Auth: Đang đăng nhập dưới tên "${useAppStore.getState().user?.name || 'Guest'}"
• Redux Toolkit: Đã dispatch fetchProductsThunk -> Đang giữ ${rtkProducts} sản phẩm.`);
    }
  },
  B9: {
    badge: 'Bài tập 9 (Hiện tại)',
    shortTitle: 'TanStack Query',
    title: 'B9: Fetching với TanStack Query (React Query v5)',
    docPath: 'docs/B9_TanStack_Query.md',
    summary:
      'Quản lý Server State, cơ chế Caching, Invalidation, Stale-While-Revalidate, Phân trang mượt mà không giật UI và Cập nhật lạc quan (Optimistic Updates).',
    topics: [
      'Bản chất Server State vs Client State (Zustand)',
      'QueryKey Factory Pattern & useQuery nâng cao',
      'Stale Time vs Garbage Collection Time (gcTime)',
      'useMutation & queryClient.invalidateQueries',
      'Kỹ thuật Optimistic Updates (onMutate, onError rollback)',
      'Phân trang với keepPreviousData & Prefetching'
    ],
    codeSnippet: `// Custom Query Hook with Factory & Optimistic Update
export function useProducts(page: number, search: string) {
  return useQuery({
    queryKey: productKeys.list({ page, search }),
    queryFn: () => api.fetchProducts({ page, search }),
    staleTime: 10000,
    placeholderData: keepPreviousData
  });
}`,
    demoAction: 'Run TanStack Query Simulator',
    demoHandler: async () => {
      const demoKey = ['products', 'list', { page: 1 }];
      const query = queryClient.buildQuery({
        queryKey: demoKey,
        queryFn: async () => {
          await new Promise(r => setTimeout(r, 300));
          return [
            { id: 1, title: 'MacBook Pro M3 Max', price: 3499 },
            { id: 2, title: 'Bàn phím cơ Custom Q1', price: 210 }
          ];
        },
        staleTime: 5000
      });

      const t0 = performance.now();
      await query.fetch();
      const t1 = performance.now();
      const fetchDuration = Math.round(t1 - t0);

      const isStale = query.isStale();
      queryClient.setQueryData(demoKey, old => [
        { id: 'temp-' + Date.now(), title: '⚡ Sản phẩm Lạc Quan (0ms)', price: 150 },
        ...(old || [])
      ]);
      const optimisticList = queryClient.getQueryData(demoKey);

      alert(`⚡ [B9 TanStack Query Simulation]:
1. Cache Miss (Lần đầu): Gọi API mất ~${fetchDuration}ms
2. Cache Hit (Lần 2): Trả ngay từ RAM (0ms latency, Stale: ${isStale ? 'Có' : 'Chưa'})
3. Optimistic Update: Thêm thành công sản phẩm tức thì (Tổng: ${optimisticList.length} items)`);
    }
  },
  B10: {
    badge: 'Bài tập 10 (Mới)',
    shortTitle: 'Next.js + TypeScript',
    title: 'B10: Next.js (App Router) & TypeScript Integration',
    docPath: 'docs/B10_NextJS_TypeScript.md',
    summary:
      'Làm chủ Next.js 14/15 App Router, phân biệt React Server Components (RSC) vs Client Components ("use client"), chiến lược SSR/SSG/ISR, định kiểu TypeScript cho Page/Layout/Metadata và Middleware Auth Guard bảo vệ trang B4-B9.',
    topics: [
      'React Server Components (RSC 0kB JS) vs Client Components ("use client")',
      'Chiến lược Rendering: SSR, SSG (generateStaticParams), ISR (revalidate)',
      'Định kiểu TypeScript nghiêm ngặt: PageProps, LayoutProps, Metadata, NextRequest',
      'Next.js Edge Middleware Auth Guard bảo vệ các route /dashboard (B4-B9)',
      'Server Actions ("use server") & revalidatePath'
    ],
    codeSnippet: `// Next.js Edge Middleware Auth Guard (middleware.ts)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('nextjs_auth_token')?.value;
  const policyAccepted = request.cookies.get('policy_accepted')?.value === 'true';

  if (request.nextUrl.pathname.startsWith('/dashboard') && (!token || !policyAccepted)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}`,
    demoAction: 'Run Next.js RSC + Middleware Simulator',
    demoHandler: async () => {
      const rscMetrics = await simulateNextRenderingStrategy('RSC');
      const currentUser = useAppStore.getState().user;
      const mwCheck = nextAuthMiddleware.execute({
        pathname: '/dashboard/lessons-b4-b9',
        token: useAppStore.getState().token,
        policyAccepted: Boolean(currentUser?.policyAccepted)
      });
      const actionRes = await executeServerAction({
        email: currentUser?.email || 'intern@dev.vn',
        role: currentUser?.role || 'INTERN'
      });

      alert(`🚀 [B10 Next.js + TypeScript Simulation]:
1. Middleware Guard: [${mwCheck.status}] ${mwCheck.action} -> ${mwCheck.message}
2. Rendering Strategy: ${rscMetrics.name} (TTFB: ${rscMetrics.ttfbMs}ms, Client JS: ${rscMetrics.clientJsKb}kB)
3. Server Action ("use server"): ${actionRes.message}`);
    }
  },
  B11: {
    badge: 'Bài tập 11 (Mới)',
    shortTitle: 'Form Handling + Policy',
    title: 'B11: Form Handling (React Hook Form + Zod + Policy Popup)',
    docPath: 'docs/B11_Form_Handling.md',
    summary:
      'Xây dựng Form Đăng ký & Đăng nhập chuyên nghiệp với React Hook Form + Zod Schema Validation, kiểm tra khớp mật khẩu (.refine), đánh giá độ mạnh mật khẩu, nút tích chấp nhận Policy và Popup Chính sách tự chế đồng bộ 2 chiều.',
    topics: [
      'Uncontrolled Hook Form (useForm) tối ưu 0 lần re-render thừa',
      'Zod Schema Validation & tự động suy diễn kiểu z.infer<typeof schema>',
      'Cross-field validation (.refine) kiểm tra mật khẩu xác nhận',
      'Bắt buộc tích chọn Checkbox chấp nhận Policy (z.literal(true))',
      'Popup Chính sách tự chế đồng bộ tự động setValue("acceptPolicy", true)'
    ],
    codeSnippet: `// Zod Schema với .refine() & bắt buộc tích chọn Policy
export const registerSchema = z.object({
  fullName: z.string().min(3, 'Tối thiểu 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6).regex(/[A-Za-z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
  acceptPolicy: z.literal(true, {
    errorMap: () => ({ message: 'Phải tích đồng ý Chính sách!' })
  })
}).refine(d => d.password === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Mật khẩu xác nhận không khớp'
});`,
    demoAction: 'Mở Popup Chính Sách Tự Chế (B11 Demo)',
    demoHandler: () => {
      openPolicyModal();
    }
  }
};

let currentLesson = 'B4';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderQuickOverviewGrid() {
  const grid = document.querySelector('#b4-b9-quick-grid');
  if (!grid) return;

  grid.innerHTML = Object.entries(lessonsData)
    .map(([key, item]) => {
      const isActive = key === currentLesson;
      const isNew = key === 'B10' || key === 'B11';
      return `
        <div data-quick-lesson="${key}"
          class="p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            isActive
              ? 'bg-indigo-600/15 border-indigo-500 shadow-lg scale-[1.01]'
              : 'bg-slate-100/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400'
          }">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                isNew
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }">${key}</span>
              <span class="text-[11px] font-semibold ${
                isNew ? 'text-purple-400' : 'text-emerald-400'
              }">${item.badge}</span>
            </div>
            <h4 class="font-bold text-sm text-slate-800 dark:text-white">${item.shortTitle}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${item.summary}</p>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span class="font-bold text-indigo-600 dark:text-indigo-400">Xem bài ${key} →</span>
            <a href="${item.docPath}" target="_blank" onclick="event.stopPropagation()"
              class="text-slate-500 hover:text-indigo-400 underline font-mono text-[11px]">Docs .md</a>
          </div>
        </div>
      `;
    })
    .join('');

  grid.querySelectorAll('[data-quick-lesson]').forEach(card => {
    card.addEventListener('click', () => {
      const lessonKey = card.getAttribute('data-quick-lesson');
      if (lessonKey) renderLessonPanel(lessonKey);
    });
  });
}

function renderLessonPanel(lessonKey) {
  const lesson = lessonsData[lessonKey];
  if (!lesson) return;

  currentLesson = lessonKey;
  const panel = document.querySelector('#lesson-panel');
  const docsBtn = document.querySelector('#open-docs-btn');

  if (docsBtn) docsBtn.href = lesson.docPath;

  // Update tab buttons styles
  const tabButtons = document.querySelectorAll('#lesson-tabs button');
  tabButtons.forEach(btn => {
    if (btn.dataset.lesson === lessonKey) {
      btn.className =
        'px-4 py-2 rounded-xl font-bold text-sm transition-all bg-indigo-600 text-white shadow-md scale-105 cursor-pointer';
    } else {
      btn.className =
        'px-4 py-2 rounded-xl font-bold text-sm transition-all bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer';
    }
  });

  renderQuickOverviewGrid();

  if (panel) {
    panel.innerHTML = `
      <div class="lg:col-span-6 space-y-6">
        <div>
          <span class="badge-tag">${lessonKey} MODULE • ${lesson.badge}</span>
          <h3 class="text-2xl font-bold text-slate-800 dark:text-white mt-2">${lesson.title}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">${lesson.summary}</p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <strong class="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">Các Nội Dung Trọng Tâm:</strong>
          <ul class="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            ${lesson.topics
              .map(
                t =>
                  `<li class="flex items-start gap-2"><span class="text-indigo-500 font-bold">•</span><span>${t}</span></li>`
              )
              .join('')}
          </ul>
        </div>

        <div class="flex flex-wrap gap-3">
          <button id="run-demo-btn" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
            ${lesson.demoAction}
          </button>
          <a href="${lesson.docPath}" target="_blank" class="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            Đọc Báo Cáo Chi Tiết (${lesson.docPath})
          </a>
        </div>
      </div>

      <div class="lg:col-span-6">
        <div class="card-terminal h-full flex flex-col justify-between">
          <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <span class="text-xs font-mono text-slate-400">${lessonKey} TypeScript / React Sample</span>
            <div class="flex space-x-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
          </div>
          <pre class="text-slate-200 text-xs font-mono leading-relaxed overflow-x-auto p-2"><code>${escapeHtml(
            lesson.codeSnippet
          )}</code></pre>
          <div class="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center">
            <small class="text-xs text-emerald-400 font-mono">✓ Unlocked via Next.js Auth Guard</small>
            <small class="text-xs text-indigo-400 font-mono">Status: 100% Completed</small>
          </div>
        </div>
      </div>
    `;

    document.querySelector('#run-demo-btn')?.addEventListener('click', lesson.demoHandler);
  }
}

document.querySelector('#lesson-tabs')?.addEventListener('click', e => {
  const btn = e.target.closest('button[data-lesson]');
  if (btn) {
    renderLessonPanel(btn.dataset.lesson);
  }
});

// ============================================================================
// 4. POPUP CHÍNH SÁCH TỰ CHẾ (CUSTOM POLICY MODAL)
// ============================================================================

function renderPolicyModalClauses() {
  const container = document.querySelector('#policy-clauses-list');
  if (!container) return;

  container.innerHTML =
    CUSTOM_POLICY_CLAUSES.map(
      clause => `
      <div class="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-indigo-500/40 transition-colors">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">${clause.code}</span>
            <h4 class="font-bold text-white text-sm">${clause.title}</h4>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">${clause.badge}</span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed pl-1">${clause.content}</p>
      </div>
    `
    ).join('') +
    `
      <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed">
        <strong>📌 Cam kết vui vẻ của Thực tập sinh:</strong> Tôi đồng ý viết code sạch sẽ, không dùng <code>any</code> bừa bãi, validate đầy đủ mọi Form trước khi gửi và hoàn thành trọn vẹn các bài tập từ <strong>B4 — B9</strong> cũng như <strong>B10 — B11</strong>!
      </div>
    `;
}

function openPolicyModal() {
  const modal = document.querySelector('#policy-modal');
  if (modal) {
    modal.hidden = false;
    modal.classList.remove('hidden');
  }
}

function closePolicyModal() {
  const modal = document.querySelector('#policy-modal');
  if (modal) {
    modal.hidden = true;
    modal.classList.add('hidden');
  }
}

// Sự kiện mở/đóng Popup Chính sách
document.querySelector('#open-policy-modal-link')?.addEventListener('click', openPolicyModal);
document.querySelector('#open-policy-preview-btn')?.addEventListener('click', openPolicyModal);
document.querySelector('#nav-open-policy-btn')?.addEventListener('click', openPolicyModal);
document.querySelector('#close-policy-modal-x')?.addEventListener('click', closePolicyModal);
document.querySelector('#close-policy-modal-btn')?.addEventListener('click', closePolicyModal);

// Đóng khi click ra ngoài vùng đen của Modal
document.querySelector('#policy-modal')?.addEventListener('click', e => {
  if (e.target.id === 'policy-modal') {
    closePolicyModal();
  }
});

// Nút "Tôi Đã Đọc Hiểu & Đồng Ý Chính Sách" trong Popup -> Tự động tích Checkbox!
document.querySelector('#accept-policy-modal-btn')?.addEventListener('click', () => {
  const policyCheckbox = document.querySelector('#input-accept-policy');
  if (policyCheckbox) {
    policyCheckbox.checked = true;
    syncPolicyCheckboxUI();
  }
  closePolicyModal();
  showAuthBanner(
    'success',
    '✅ Bạn đã đọc và đồng ý với Chính sách Học viên! Ô tích chọn Policy đã được bật tự động.'
  );
});

// ============================================================================
// 5. TRANG ĐĂNG KÝ / ĐĂNG NHẬP & FORM HANDLING (B10 & B11)
// ============================================================================

let authMode = 'login'; // 'login' | 'register'

function setAuthMode(mode) {
  authMode = mode;

  // Cập nhật nút Tab
  const tabBtns = document.querySelectorAll('#auth-mode-tabs button');
  tabBtns.forEach(btn => {
    if (btn.dataset.authMode === mode) {
      btn.className =
        'px-5 py-2 rounded-xl text-sm font-bold transition-all bg-indigo-600 text-white shadow-md cursor-pointer';
    } else {
      btn.className =
        'px-5 py-2 rounded-xl text-sm font-bold transition-all text-slate-400 hover:text-white cursor-pointer';
    }
  });

  // Ẩn/hiện các trường dành riêng cho Đăng ký
  const fullNameWrap = document.querySelector('#field-fullname-wrap');
  const roleWrap = document.querySelector('#field-role-wrap');
  const emailCol = document.querySelector('#field-email-col');
  const confirmWrap = document.querySelector('#field-confirm-wrap');
  const submitText = document.querySelector('#auth-submit-text');
  const switchLink = document.querySelector('#switch-auth-mode-link');

  if (mode === 'register') {
    if (fullNameWrap) {
      fullNameWrap.hidden = false;
      fullNameWrap.classList.remove('hidden');
    }
    if (roleWrap) {
      roleWrap.hidden = false;
      roleWrap.classList.remove('hidden');
    }
    if (emailCol) emailCol.className = 'sm:col-span-7';
    if (confirmWrap) {
      confirmWrap.hidden = false;
      confirmWrap.classList.remove('hidden');
    }
    if (submitText) submitText.textContent = 'Đăng Ký Tài Khoản & Vào Xem Bài Tập (B4 — B9)';
    if (switchLink) switchLink.textContent = 'Đã có tài khoản? Bấm vào đây để chuyển về Đăng Nhập →';
  } else {
    if (fullNameWrap) {
      fullNameWrap.hidden = true;
      fullNameWrap.classList.add('hidden');
    }
    if (roleWrap) {
      roleWrap.hidden = true;
      roleWrap.classList.add('hidden');
    }
    if (emailCol) emailCol.className = 'sm:col-span-12';
    if (confirmWrap) {
      confirmWrap.hidden = true;
      confirmWrap.classList.add('hidden');
    }
    if (submitText) submitText.textContent = 'Đăng Nhập & Mở Khóa Các Bài Tập (B4 — B9)';
    if (switchLink) switchLink.textContent = 'Chưa có tài khoản? Bấm vào đây để chuyển sang Đăng Ký Tài Khoản mới →';
  }

  clearAllFieldErrors();
  hideAuthBanner();
  updateFormInspector();
}

document.querySelector('#auth-mode-tabs')?.addEventListener('click', e => {
  const btn = e.target.closest('button[data-auth-mode]');
  if (btn) {
    setAuthMode(btn.dataset.authMode);
  }
});

document.querySelector('#switch-auth-mode-link')?.addEventListener('click', () => {
  setAuthMode(authMode === 'login' ? 'register' : 'login');
});

// Nút Hiện/Ẩn mật khẩu
document.querySelector('#toggle-password-btn')?.addEventListener('click', () => {
  const passInput = document.querySelector('#input-password');
  const toggleBtn = document.querySelector('#toggle-password-btn');
  if (!passInput || !toggleBtn) return;

  if (passInput.type === 'password') {
    passInput.type = 'text';
    toggleBtn.textContent = 'Ẩn';
  } else {
    passInput.type = 'password';
    toggleBtn.textContent = 'Hiện';
  }
});

// Nút "Điền nhanh Tài khoản Demo"
document.querySelector('#fill-demo-btn')?.addEventListener('click', () => {
  const demo = getDemoCredentials();
  const fullNameEl = document.querySelector('#input-fullname');
  const emailEl = document.querySelector('#input-email');
  const roleEl = document.querySelector('#input-role');
  const passEl = document.querySelector('#input-password');
  const confirmEl = document.querySelector('#input-confirm-password');
  const policyEl = document.querySelector('#input-accept-policy');

  if (fullNameEl) fullNameEl.value = demo.fullName;
  if (emailEl) emailEl.value = authMode === 'register' ? `thinh.intern.${Math.floor(Math.random() * 90 + 10)}@dev.vn` : demo.email;
  if (roleEl) roleEl.value = demo.role;
  if (passEl) passEl.value = demo.password;
  if (confirmEl) confirmEl.value = demo.password;
  if (policyEl) policyEl.checked = true;

  updatePasswordMeter(demo.password);
  syncPolicyCheckboxUI();
  clearAllFieldErrors();
  showAuthBanner(
    'info',
    '⚡ Đã điền sẵn thông tin hợp lệ và tích chọn đồng ý Policy! Bấm nút bên dưới để vào xem các bài tập từ B4 — B9.'
  );
  updateFormInspector();
});

function getFormValues() {
  const password = document.querySelector('#input-password')?.value || '';
  const rawConfirm = document.querySelector('#input-confirm-password')?.value || '';
  return {
    fullName: document.querySelector('#input-fullname')?.value || '',
    email: document.querySelector('#input-email')?.value || '',
    role: document.querySelector('#input-role')?.value || 'INTERN',
    password,
    confirmPassword: rawConfirm || password,
    acceptPolicy: Boolean(document.querySelector('#input-accept-policy')?.checked)
  };
}

function updatePasswordMeter(password) {
  const info = evaluatePasswordStrength(password);
  const bar = document.querySelector('#password-strength-bar');
  const label = document.querySelector('#password-strength-label');

  if (bar) {
    const widths = ['w-0', 'w-1/4', 'w-2/4', 'w-3/4', 'w-full'];
    bar.className = `h-full transition-all duration-300 ${widths[info.score]} ${info.color}`;
  }
  if (label) {
    label.className = `text-[11px] font-mono shrink-0 ${info.textColor}`;
    label.textContent = `Độ mạnh: ${info.label}`;
  }
}

function syncPolicyCheckboxUI() {
  const checked = Boolean(document.querySelector('#input-accept-policy')?.checked);
  const badge = document.querySelector('#policy-status-badge');
  const box = document.querySelector('#policy-box-container');
  const errEl = document.querySelector('#error-acceptPolicy');

  if (badge) {
    if (checked) {
      badge.className =
        'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      badge.textContent = 'Đã đồng ý Policy ✓';
    } else {
      badge.className =
        'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30';
      badge.textContent = 'Chưa tích chọn';
    }
  }

  if (checked) {
    if (box) box.className = 'p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 transition-all';
    if (errEl) {
      errEl.classList.add('hidden');
      errEl.textContent = '';
    }
  } else {
    if (box) box.className = 'p-4 rounded-2xl bg-slate-950/90 border border-slate-800 transition-all';
  }

  updateFormInspector();
}

function clearAllFieldErrors() {
  ['fullName', 'email', 'password', 'confirmPassword', 'acceptPolicy'].forEach(field => {
    const errEl = document.querySelector(`#error-${field}`);
    if (errEl) {
      errEl.classList.add('hidden');
      errEl.textContent = '';
    }
  });
}

function renderFieldErrors(errors) {
  clearAllFieldErrors();
  Object.entries(errors).forEach(([field, message]) => {
    const errEl = document.querySelector(`#error-${field}`);
    if (errEl && message) {
      errEl.textContent = `⚠️ ${message}`;
      errEl.classList.remove('hidden');
    }
  });

  if (errors.acceptPolicy) {
    const box = document.querySelector('#policy-box-container');
    if (box) {
      box.className = 'p-4 rounded-2xl bg-rose-950/30 border border-rose-500/60 transition-all';
    }
  }
}

function showAuthBanner(type, message) {
  const box = document.querySelector('#auth-alert-box');
  if (!box) return;

  box.classList.remove('hidden');
  if (type === 'error') {
    box.className = 'mb-5 p-4 rounded-2xl border text-xs font-medium bg-rose-500/15 border-rose-500/40 text-rose-200';
  } else if (type === 'success') {
    box.className =
      'mb-5 p-4 rounded-2xl border text-xs font-medium bg-emerald-500/15 border-emerald-500/40 text-emerald-200';
  } else {
    box.className =
      'mb-5 p-4 rounded-2xl border text-xs font-medium bg-indigo-500/15 border-indigo-500/40 text-indigo-200';
  }
  box.textContent = message;
}

function hideAuthBanner() {
  const box = document.querySelector('#auth-alert-box');
  if (box) box.classList.add('hidden');
}

function updateFormInspector() {
  const values = getFormValues();
  const validation =
    authMode === 'login' ? validateLoginSchema(values) : validateRegisterSchema(values);

  const modeEl = document.querySelector('#inspector-mode');
  const policyEl = document.querySelector('#inspector-policy');
  const validEl = document.querySelector('#inspector-valid');

  if (modeEl) modeEl.textContent = `"${authMode}"`;
  if (policyEl) {
    policyEl.textContent = String(values.acceptPolicy);
    policyEl.className = values.acceptPolicy ? 'text-emerald-400 font-bold' : 'text-amber-400';
  }
  if (validEl) {
    validEl.textContent = String(validation.success);
    validEl.className = validation.success ? 'text-emerald-400 font-bold' : 'text-rose-400';
  }
}

// Lắng nghe sự kiện gõ phím & tích chọn trên Form
document.querySelector('#input-password')?.addEventListener('input', e => {
  updatePasswordMeter(e.target.value);
  updateFormInspector();
});

document.querySelector('#input-accept-policy')?.addEventListener('change', () => {
  syncPolicyCheckboxUI();
});

['#input-fullname', '#input-email', '#input-confirm-password', '#input-role'].forEach(sel => {
  document.querySelector(sel)?.addEventListener('input', updateFormInspector);
});

// Xử lý Submit Form Đăng nhập / Đăng ký
document.querySelector('#auth-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const values = getFormValues();

  // 1. Validate bằng Schema của B11 (validateLoginSchema / validateRegisterSchema)
  const validation =
    authMode === 'login' ? validateLoginSchema(values) : validateRegisterSchema(values);

  if (!validation.success) {
    renderFieldErrors(validation.errors);
    showAuthBanner(
      'error',
      'Vui lòng kiểm tra lại các trường báo đỏ bên dưới (đặc biệt là nút tích chấp nhận Chính sách Policy)!'
    );
    return;
  }

  clearAllFieldErrors();

  // 2. Xác thực hoặc tạo tài khoản mới
  const result =
    authMode === 'login'
      ? authenticateUserAccount(validation.data)
      : registerNewUserAccount(validation.data);

  if (!result.ok) {
    renderFieldErrors({ [result.field]: result.message });
    showAuthBanner('error', result.message);
    return;
  }

  // 3. Lưu vào Zustand Global Auth Store (B8) & Kiểm tra qua Next.js Middleware (B10)
  useAppStore.getState().login(result.user, result.token);
  nextAuthMiddleware.execute({
    pathname: '/dashboard',
    token: result.token,
    policyAccepted: true
  });

  // 4. Chuyển sang màn hình Dashboard hiển thị các bài tập từ B4 - B9 (và B10 - B11)
  syncAuthView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================================================
// 6. ĐIỀU HƯỚNG GIỮA TRANG ĐĂNG NHẬP VÀ DASHBOARD BÀI TẬP 4-9
// ============================================================================

function syncAuthView() {
  const { isAuthenticated, user, token } = useAppStore.getState();
  const authPortal = document.querySelector('#auth-portal-view');
  const dashboardView = document.querySelector('#dashboard-view');
  const authNavbar = document.querySelector('#auth-navbar');

  const isAuthorized = Boolean(isAuthenticated && user && token);

  if (isAuthorized) {
    if (authPortal) {
      authPortal.hidden = true;
      authPortal.classList.add('hidden');
    }
    if (dashboardView) {
      dashboardView.hidden = false;
      dashboardView.classList.remove('hidden');
    }
    if (authNavbar) {
      authNavbar.hidden = false;
      authNavbar.classList.remove('hidden');
    }

    // Cập nhật thông tin user trên thanh Navbar
    const nameEl = document.querySelector('#nav-user-name');
    const emailEl = document.querySelector('#nav-user-email');
    const roleEl = document.querySelector('#nav-user-role');

    if (nameEl) nameEl.textContent = user.name || 'Thịnh Intern';
    if (emailEl) emailEl.textContent = user.email || 'intern@dev.vn';
    if (roleEl) roleEl.textContent = user.role || 'INTERN';
  } else {
    if (authPortal) {
      authPortal.hidden = false;
      authPortal.classList.remove('hidden');
    }
    if (dashboardView) {
      dashboardView.hidden = true;
      dashboardView.classList.add('hidden');
    }
    if (authNavbar) {
      authNavbar.hidden = true;
      authNavbar.classList.add('hidden');
    }
  }
}

// Nút Đăng xuất (Quay về trang Đăng ký / Đăng nhập)
document.querySelector('#logout-btn')?.addEventListener('click', () => {
  useAppStore.getState().logout();
  syncAuthView();
  showAuthBanner(
    'info',
    '👋 Bạn đã đăng xuất. Hãy tích chọn chấp nhận Policy và đăng nhập lại để xem các bài tập từ B4 — B9!'
  );
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================================================
// 7. INITIALIZE APPLICATION
// ============================================================================

renderPolicyModalClauses();
renderTasks();
updateProgress();
renderUsers();
renderLessonPanel('B4');
updateFormInspector();
syncAuthView();
