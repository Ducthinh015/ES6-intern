import { createCounter } from './closure.js';
import { users, getUsersView, totalAge } from './array-methods.js';
import { runSequentialDemo, runParallelDemo } from './async.js';
import { playEventLoopDemo } from './event-loop.js';
import { useAppStore } from '../modules/b8_state_management/zustand_store.js';
import { reduxStore, fetchProductsThunk } from '../modules/b8_state_management/redux_toolkit_store.js';
import { queryClient } from '../modules/b9_tanstack_query/tanstack_query_engine.js';

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
  'B9: Fetching với TanStack Query (Server State, Caching, Invalidation, Optimistic Updates)'
];

let completed = tasks.map(() => false);

function renderTasks() {
  const list = document.querySelector('#task-list');
  if (!list) return;
  list.innerHTML = '';

  tasks.forEach((task, index) => {
    const row = document.createElement('label');
    row.className = 'task flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 mb-1';

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
    const group = index < 4 ? 'JS Nền tảng' : index < 10 ? 'JS Bất đồng bộ & Core' : index < 12 ? 'React & Module Nội bộ' : 'TS, Performance & State';
    text.innerHTML = `<strong class="block text-sm font-semibold text-slate-800 dark:text-slate-200">${String(index + 1).padStart(2, '0')}. ${task}</strong><small class="text-xs text-slate-400">${group}</small>`;

    row.append(checkbox, text);
    list.append(row);
  });
}

function updateProgress() {
  const done = completed.filter(Boolean).length;
  const percent = Math.round(done / completed.length * 100);
  const label = document.querySelector('#progress-label');
  const bar = document.querySelector('#progress-bar');
  const copy = document.querySelector('#progress-copy');

  if (label) label.textContent = `${percent}%`;
  if (bar) bar.style.width = `${percent}%`;
  if (copy) {
    copy.textContent =
      done === 16 ? '🎉 Hoàn thành toàn bộ lộ trình khóa học FE (B1 - B9)!' :
      done >= 11 ? 'Đang chinh phục các module React, TS, State Management & TanStack Query!' :
      done >= 5 ? 'Đã nắm chắc nền tảng JS Core & Async.' :
      'Bắt đầu học từ nền tảng Scope & Closure.';
  }
}

document.querySelector('#reset-btn')?.addEventListener('click', () => {
  completed = completed.map(() => false);
  renderTasks();
  updateProgress();
});

// Interactive Labs B1-B3
const inc = createCounter();
document.querySelector('#counter-btn')?.addEventListener('click', () => {
  const val = document.querySelector('#counter-value');
  if (val) val.textContent = inc();
});

function renderUsers(mode = 'all') {
  const view = document.querySelector('#users-view');
  if (!view) return;
  const data = getUsersView(mode);

  view.innerHTML = data.map(item => {
    if (typeof item === 'string') return `<div class="user p-2 bg-slate-100 dark:bg-slate-800 rounded font-medium text-xs"><strong>${item}</strong></div>`;
    return `<div class="user p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs"><strong>${item.name}</strong><span class="block text-slate-400">${item.age} tuổi · ${item.active ? 'active' : 'inactive'}</span></div>`;
  }).join('');
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

// Interactive Lesson Data for B4 - B8
const lessonsData = {
  B4: {
    title: 'B4: React Fundamentals',
    docPath: 'DOCUMENTATION.md',
    summary: 'Nắm vững tư duy Component, JSX, Props, State, useState & useEffect, Render Danh Sách & Keys, Controlled Inputs và Cơ chế Re-render.',
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
      alert('⚡ React Component State updated! Re-render triggered with Virtual DOM reconciliation.');
    }
  },
  B5: {
    title: 'B5: Tổng Quan Module Nội Bộ (Lark Wiki)',
    docPath: 'DOCUMENTATION.md',
    summary: '1 Buổi (2h) bao gồm Chạy project local, Cấu trúc thư mục chuẩn doanh nghiệp, Luồng dữ liệu (Routing → Data → Render) và Mentor Q&A.',
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
      alert('🚀 Navigated to /users -> Interceptor attached JWT Token -> Rendered <UserManagementPage />');
    }
  },
  B6: {
    title: 'B6: TypeScript Integration',
    docPath: 'DOCUMENTATION.md',
    summary: '2 Buổi (2h + 1h): Định kiểu Props/State/Event trong React, Type Narrowing, Generics, loại bỏ `any` bằng `unknown` và đạt Type Coverage > 90%.',
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
      alert('✅ Type Guard Verified: Data is safe and strongly typed without any TS compiler warnings!');
    }
  },
  B7: {
    title: 'B7: React Advanced Performance & Custom Hooks',
    docPath: 'DOCUMENTATION.md',
    summary: '2 Buổi (2h + 1h): Tối ưu hóa render với useMemo, useCallback, React.memo, viết Custom Hooks đóng gói logic và dùng React Profiler.',
    topics: [
      'useRef vs useState (lưu dữ liệu không trigger re-render)',
      'useMemo & useCallback (memoization đúng cách)',
      'React.memo ngăn ngừa child component re-renders',
      'Viết Custom Hooks (useFetch, useDebounce, useLocalStorage)',
      'React DevTools Profiler & Flamegraph analysis'
    ],
    codeSnippet: `// Custom Hook: useDebounce
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}`,
    demoAction: 'Run Performance Memoization Check',
    demoHandler: () => {
      alert('⚡ Memoization Check Passed: Child component skipped 0ms re-render using React.memo!');
    }
  },
  B8: {
    title: 'B8: State Management (Zustand & Redux Toolkit)',
    docPath: 'docs/B8_State_Management.md',
    summary: 'Quản lý Global State với Zustand (Slices, Middleware Persist localStorage, Devtools) và Redux Toolkit (Slices, createAsyncThunk, Reselect memoized selectors).',
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
      // 1. Dispatch Zustand action
      useAppStore.getState().addToCart({
        id: 'prod_' + Math.floor(Math.random() * 1000),
        name: 'Sản phẩm demo ' + (useAppStore.getState().cartItems.length + 1),
        price: 99
      });
      const cartCount = useAppStore.getState().getCartTotalCount();
      const totalPrice = useAppStore.getState().getCartTotalPrice();

      // 2. Dispatch RTK async thunk
      await reduxStore.dispatch(fetchProductsThunk(2));
      const rtkProducts = reduxStore.getState().products.items.length;

      alert(`✅ [B8 State Management Test]:
• Zustand Cart: ${cartCount} sản phẩm (Tổng: $${totalPrice}) -> Đã đồng bộ localStorage ['app-global-storage']!
• Redux Toolkit: Đã dispatch fetchProductsThunk -> Đang giữ ${rtkProducts} sản phẩm trong store.`);
    }
  },
  B9: {
    title: 'B9: Fetching với TanStack Query (React Query v5)',
    docPath: 'docs/B9_TanStack_Query.md',
    summary: 'Quản lý Server State, cơ chế Caching, Invalidation, Stale-While-Revalidate, Phân trang mượt mà không giật UI và Cập nhật lạc quan (Optimistic Updates) kèm Rollback tự động.',
    topics: [
      'Bản chất Server State vs Client State (Zustand)',
      'QueryKey Factory Pattern & useQuery nâng cao',
      'Stale Time vs Garbage Collection Time (gcTime)',
      'useMutation & queryClient.invalidateQueries',
      'Kỹ thuật Optimistic Updates (onMutate, onError rollback)',
      'Phân trang với keepPreviousData & Prefetching'
    ],
    codeSnippet: `// Custom Query Hook with Factory & Optimistic Update
export function useProducts(page, search) {
  return useQuery({
    queryKey: productKeys.list({ page, search }),
    queryFn: () => api.fetchProducts({ page, search }),
    staleTime: 10000,
    placeholderData: keepPreviousData
  });
}`,
    demoAction: 'Run TanStack Query Simulator (Cache & Optimistic UI)',
    demoHandler: async () => {
      const demoKey = ['products', 'list', { page: 1 }];
      const query = queryClient.buildQuery({
        queryKey: demoKey,
        queryFn: async () => {
          await new Promise(r => setTimeout(r, 400));
          return [
            { id: 1, title: 'MacBook Pro M3 Max', price: 3499 },
            { id: 2, title: 'Bàn phím cơ Custom Q1', price: 210 }
          ];
        },
        staleTime: 5000
      });

      // 1. Lần fetch đầu tiên (Cache Miss)
      const t0 = performance.now();
      await query.fetch();
      const t1 = performance.now();
      const fetchDuration = Math.round(t1 - t0);

      // 2. Lần lấy thứ 2 trong staleTime (Cache Hit 0ms!)
      const cached = queryClient.getQueryData(demoKey);
      const isStale = query.isStale();

      // 3. Test Optimistic Update
      queryClient.setQueryData(demoKey, old => [
        { id: 'temp-' + Date.now(), title: '⚡ Sản phẩm Lạc Quan (0ms)', price: 150 },
        ...(old || [])
      ]);
      const optimisticList = queryClient.getQueryData(demoKey);

      alert(`⚡ [B9 TanStack Query Simulation]:
1. Cache Miss (Lần đầu): Gọi API mất ~${fetchDuration}ms
2. Cache Hit (Lần 2): Trả ngay lập tức từ RAM (0ms latency, Stale: ${isStale ? 'Có' : 'Chưa'})
3. Optimistic Update: Thêm thành công sản phẩm tạm thời (Tổng: ${optimisticList.length} items)
4. Tự động đồng bộ chuẩn xác khi queryClient.invalidateQueries() được gọi!`);
    }
  }
};

let currentLesson = 'B4';

function renderLessonPanel(lessonKey) {
  const lesson = lessonsData[lessonKey];
  if (!lesson) return;

  currentLesson = lessonKey;
  const panel = document.querySelector('#lesson-panel');
  const docsBtn = document.querySelector('#open-docs-btn');
  const docsTabLabel = document.querySelector('#docs-tab-label');

  if (docsBtn) docsBtn.href = lesson.docPath;
  if (docsTabLabel) docsTabLabel.textContent = lessonKey;

  // Update tab buttons styles
  const tabButtons = document.querySelectorAll('#lesson-tabs button');
  tabButtons.forEach(btn => {
    if (btn.dataset.lesson === lessonKey) {
      btn.className = 'px-4 py-2 rounded-xl font-bold text-sm transition-all bg-indigo-600 text-white shadow-md scale-105';
    } else {
      btn.className = 'px-4 py-2 rounded-xl font-bold text-sm transition-all bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700';
    }
  });

  if (panel) {
    panel.innerHTML = `
      <div class="lg:col-span-6 space-y-6">
        <div>
          <span class="badge-tag">${lessonKey} MODULE</span>
          <h3 class="text-2xl font-bold text-slate-800 dark:text-white mt-2">${lesson.title}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">${lesson.summary}</p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <strong class="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">Các Nội Dung Trọng Tâm:</strong>
          <ul class="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            ${lesson.topics.map(t => `<li class="flex items-start gap-2"><span class="text-indigo-500 font-bold">•</span><span>${t}</span></li>`).join('')}
          </ul>
        </div>

        <div class="flex gap-3">
          <button id="run-demo-btn" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
            ${lesson.demoAction}
          </button>
          <a href="${lesson.docPath}" target="_blank" class="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            Đọc Tài Liệu Chi Tiết (.md)
          </a>
        </div>
      </div>

      <div class="lg:col-span-6">
        <div class="card-terminal h-full flex flex-col justify-between">
          <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <span class="text-xs font-mono text-slate-400">${lessonKey} Code Sample</span>
            <div class="flex space-x-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
          </div>
          <pre class="text-slate-200 text-xs font-mono leading-relaxed overflow-x-auto p-2"><code>${escapeHtml(lesson.codeSnippet)}</code></pre>
          <div class="mt-4 pt-3 border-t border-slate-800/60 text-right">
            <small class="text-xs text-indigo-400 font-mono">Status: Ready to practice</small>
          </div>
        </div>
      </div>
    `;

    document.querySelector('#run-demo-btn')?.addEventListener('click', lesson.demoHandler);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

document.querySelector('#lesson-tabs')?.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-lesson]');
  if (btn) {
    renderLessonPanel(btn.dataset.lesson);
  }
});

// Initialize on page load
renderTasks();
updateProgress();
renderUsers();
renderLessonPanel('B4');
