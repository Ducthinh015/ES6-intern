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
// 1. HỆ THỐNG NHÂN VẬT RPG (EXP, LEVEL, GOLD, HUY HIỆU & BOSS FIGHT)
// ============================================================================

const RPG_STORAGE_KEY = 'fe_rpg_quest_state_v1';

const defaultRpgState = {
  exp: 500,
  gold: 450,
  clearedQuests: ['B4'],
  bossHp: 100,
  currentQuizIdx: 0
};

function loadRpgState() {
  try {
    const raw = localStorage.getItem(RPG_STORAGE_KEY);
    if (!raw) return { ...defaultRpgState };
    const parsed = JSON.parse(raw);
    return {
      exp: typeof parsed.exp === 'number' ? parsed.exp : 500,
      gold: typeof parsed.gold === 'number' ? parsed.gold : 450,
      clearedQuests: Array.isArray(parsed.clearedQuests) ? parsed.clearedQuests : ['B4'],
      bossHp: typeof parsed.bossHp === 'number' ? parsed.bossHp : 100,
      currentQuizIdx: typeof parsed.currentQuizIdx === 'number' ? parsed.currentQuizIdx : 0
    };
  } catch {
    return { ...defaultRpgState };
  }
}

let rpgState = loadRpgState();

function saveRpgState() {
  try {
    localStorage.setItem(RPG_STORAGE_KEY, JSON.stringify(rpgState));
  } catch {
    // ignore storage errors
  }
}

function getLevelInfo(exp) {
  const level = Math.max(1, Math.floor(exp / 150) + 1);
  const nextLevelExp = level * 150;
  const currentLevelStart = (level - 1) * 150;
  const progressPercent = Math.min(
    100,
    Math.round(((exp - currentLevelStart) / (nextLevelExp - currentLevelStart)) * 100)
  );

  const titles = [
    'Tân Binh ES6',
    'Kiếm Sĩ DOM',
    'Hiệp Sĩ React',
    'Pháp Sư TypeScript',
    'Thợ Săn Hiệu Năng',
    'Đại Sư Zustand & Query',
    'Chúa Tể Next.js',
    'Huyền Thoại Frontend'
  ];
  const rankTitle = titles[Math.min(level - 1, titles.length - 1)];

  return { level, rankTitle, nextLevelExp, progressPercent };
}

function logBattleAction(message) {
  const logEl = document.querySelector('#rpg-battle-log');
  if (logEl) {
    logEl.textContent = message;
  }
}

function awardRpgReward({ expGain = 0, goldGain = 0, questCode = null, reason = '' }) {
  rpgState.exp += expGain;
  rpgState.gold += goldGain;

  if (questCode && !rpgState.clearedQuests.includes(questCode)) {
    rpgState.clearedQuests.push(questCode);
  }

  saveRpgState();
  renderRpgHud();
  renderQuickOverviewGrid();

  if (reason) {
    logBattleAction(`⚡ ${reason} -> Nhận thưởng +${expGain} EXP & +${goldGain} Gold!`);
  }
}

function renderRpgHud() {
  const { level, rankTitle, nextLevelExp, progressPercent } = getLevelInfo(rpgState.exp);

  const levelBadge = document.querySelector('#hud-level-badge');
  const goldDisplay = document.querySelector('#hud-gold-display');
  const expText = document.querySelector('#hud-exp-text');
  const expBar = document.querySelector('#hud-exp-bar');
  const heroRankTitle = document.querySelector('#hero-rank-title');
  const clearedCountLabel = document.querySelector('#Cleared-count-label');
  const badgesTray = document.querySelector('#rpg-badges-tray');

  if (levelBadge) levelBadge.textContent = `Lv. ${level} • ${rankTitle}`;
  if (goldDisplay) goldDisplay.textContent = `🪙 ${rpgState.gold} Gold`;
  if (expText) expText.textContent = `${rpgState.exp} / ${nextLevelExp} XP`;
  if (expBar) expBar.style.width = `${progressPercent}%`;
  if (heroRankTitle) heroRankTitle.textContent = `Lv.${level} — ${rankTitle}`;
  if (clearedCountLabel) {
    clearedCountLabel.textContent = `Đã vượt: ${rpgState.clearedQuests.length} / 8 Ải`;
  }

  // Update character attributes based on level
  const strEl = document.querySelector('#stat-str');
  const intEl = document.querySelector('#stat-int');
  const agiEl = document.querySelector('#stat-agi');
  if (strEl) strEl.textContent = String(75 + level * 3);
  if (intEl) intEl.textContent = String(80 + level * 4);
  if (agiEl) agiEl.textContent = String(78 + rpgState.clearedQuests.length * 4);

  // Render Achievement Badges
  if (badgesTray) {
    const allBadges = [
      { code: 'B4', icon: '🏰', name: 'React Knight' },
      { code: 'B5', icon: '🧭', name: 'Arch Explorer' },
      { code: 'B6', icon: '🛡️', name: 'Strict TS Paladin' },
      { code: 'B7', icon: '⚡', name: 'Zero-Lag Ninja' },
      { code: 'B8', icon: '💎', name: 'State Alchemist' },
      { code: 'B9', icon: '🐉', name: 'Query Slayer' },
      { code: 'B10', icon: '🌌', name: 'Next.js Walker' },
      { code: 'B11', icon: '📜', name: 'Zod Inquisitor' }
    ];

    badgesTray.innerHTML = allBadges
      .map(b => {
        const unlocked = rpgState.clearedQuests.includes(b.code);
        return `
          <span class="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
            unlocked
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
              : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
          }" title="${unlocked ? 'Đã mở khóa huy hiệu ' + b.code : 'Vượt ải ' + b.code + ' để mở khóa'}">
            ${b.icon} ${b.code}: ${b.name} ${unlocked ? '✓' : '🔒'}
          </span>
        `;
      })
      .join('');
  }
}

// ============================================================================
// 2. ROADMAP TASKS (B1 — B11: 18 CHẶNG NHIỆM VỤ)
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

let completed = tasks.map((_, idx) => idx >= 10);

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
      if (checkbox.checked) {
        awardRpgReward({ expGain: 25, goldGain: 10, reason: `Hoàn thành nhiệm vụ #${index + 1}` });
      }
      updateProgress();
    });

    const text = document.createElement('div');
    text.className = 'flex-1';
    const group =
      index < 4
        ? 'Ải Tân Binh: JS Nền tảng'
        : index < 10
        ? 'Ải Tinh Anh: JS Async & Core'
        : index < 12
        ? 'Chiến Dịch B4-B5: React & Architecture'
        : index < 16
        ? 'Chiến Dịch B6-B9: TS, Perf, State & Query'
        : 'Chiến Dịch B10-B11: Next.js + TS & Form';
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
        ? '👑 Tuyệt đỉnh! Bạn đã chinh phục toàn bộ 18 nhiệm vụ từ B1 đến B11!'
        : done >= 8
        ? '⚔️ Đang càn quét bản đồ chiến dịch B4-B9 cùng Next.js + TS (B10) & Form Handling (B11)!'
        : 'Hãy tích chọn hoàn thành các nhiệm vụ hoặc vượt ải để tăng EXP.';
  }
}

document.querySelector('#reset-btn')?.addEventListener('click', () => {
  completed = completed.map(() => false);
  rpgState = { ...defaultRpgState };
  saveRpgState();
  renderTasks();
  updateProgress();
  renderRpgHud();
  renderQuickOverviewGrid();
  renderBossQuiz();
});

// ============================================================================
// 3. TRAINING GROUNDS LABS B1 — B3
// ============================================================================

const inc = createCounter();
document.querySelector('#counter-btn')?.addEventListener('click', () => {
  const val = document.querySelector('#counter-value');
  if (val) val.textContent = inc();
  awardRpgReward({ expGain: 10, goldGain: 5, reason: 'Tụ khí Closure Counter thành công' });
});

function renderUsers(mode = 'all') {
  const view = document.querySelector('#users-view');
  if (!view) return;
  const data = getUsersView(mode);

  view.innerHTML = data
    .map(item => {
      if (typeof item === 'string') {
        return `<div class="user p-2 bg-slate-100 dark:bg-slate-800 rounded font-medium text-xs"><strong>⚔️ ${item}</strong></div>`;
      }
      return `<div class="user p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs"><strong>🛡️ ${item.name}</strong><span class="block text-slate-400">Lv.${item.age} · ${
        item.active ? '🟢 Sẵn sàng' : '⚪ Nghỉ ngơi'
      }</span></div>`;
    })
    .join('');
}

document.querySelector('#array-actions')?.addEventListener('click', event => {
  const button = event.target.closest('button[data-mode]');
  if (button) {
    renderUsers(button.dataset.mode);
    awardRpgReward({ expGain: 10, goldGain: 5, reason: `Triệu hồi đội hình Array (${button.dataset.mode})` });
  }
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
  awardRpgReward({ expGain: 25, goldGain: 15, reason: 'Kích hoạt Vòng Trận Pháp Event Loop hoàn tất' });
});

document.querySelector('#seq-btn')?.addEventListener('click', async () => {
  const ms = await runSequentialDemo();
  const seqTime = document.querySelector('#seq-time');
  const note = document.querySelector('#async-note');
  if (seqTime) seqTime.textContent = `${(ms / 1000).toFixed(1)}s`;
  if (note) note.textContent = 'Đánh đơn (Tuần tự): Chiêu B phải chờ chiêu A hoàn thành mới tung ra.';
  awardRpgReward({ expGain: 20, goldGain: 10, reason: 'Thử nghiệm Đánh đơn Sequential Async' });
});

document.querySelector('#par-btn')?.addEventListener('click', async () => {
  const ms = await runParallelDemo();
  const parTime = document.querySelector('#par-time');
  const note = document.querySelector('#async-note');
  if (parTime) parTime.textContent = `${(ms / 1000).toFixed(1)}s`;
  if (note) note.textContent = 'Song kiếm hợp bích (Promise.all): Hai đòn đánh tung ra đồng thời, giảm một nửa thời gian!';
  awardRpgReward({ expGain: 25, goldGain: 15, reason: 'Thi triển Song kiếm Promise.all' });
});

// ============================================================================
// 4. BẢN ĐỒ CHIẾN DỊCH CÁC ẢI B4 — B9 HIỆN TẠI & B10 — B11 MỚI
// ============================================================================

const lessonsData = {
  B4: {
    icon: '🏰',
    bossName: 'Boss: Virtual DOM Guardian',
    xpReward: 100,
    badge: 'Ải 4 (Hiện tại)',
    shortTitle: 'React Fundamentals',
    title: 'Ải B4: Đền Thờ React Fundamentals',
    docPath: 'docs/B4_React_Fundamentals.md',
    summary:
      'Làm chủ Component Architecture, JSX, Props, State, useState & 3 dạng useEffect, Render Danh Sách & Keys, Controlled Inputs và Cơ chế Re-render.',
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
    demoAction: '⚔️ Tung Tuyệt Kỹ Virtual DOM (+100 EXP)',
    demoHandler: () => {
      awardRpgReward({
        expGain: 100,
        goldGain: 50,
        questCode: 'B4',
        reason: '[Ải B4] Kích hoạt React Virtual DOM Reconciliation thành công!'
      });
    }
  },
  B5: {
    icon: '🧭',
    bossName: 'Boss: Interceptor Gatekeeper',
    xpReward: 100,
    badge: 'Ải 5 (Hiện tại)',
    shortTitle: 'Module Nội Bộ',
    title: 'Ải B5: Thành Trì Kiến Trúc Module Nội Bộ',
    docPath: 'docs/B5_Internal_Module_Overview.md',
    summary:
      'Chạy project local, Cấu trúc thư mục chuẩn doanh nghiệp (Feature-first), Luồng dữ liệu (Routing → Data → Render) và chiến thuật tìm code cấp tốc.',
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
    demoAction: '⚔️ Kích Hoạt Luồng Interceptor (+100 EXP)',
    demoHandler: () => {
      awardRpgReward({
        expGain: 100,
        goldGain: 50,
        questCode: 'B5',
        reason: '[Ải B5] Điều hướng /users -> Axios Interceptor tự động gắn Bearer JWT Token!'
      });
    }
  },
  B6: {
    icon: '🛡️',
    bossName: 'Boss: Quái Vật "any" Hỗn Mang',
    xpReward: 150,
    badge: 'Ải 6 (Hiện tại)',
    shortTitle: 'TypeScript Integration',
    title: 'Ải B6: Pháo Đài Strict TypeScript (>90%)',
    docPath: 'docs/B6_TypeScript_Integration.md',
    summary:
      'Định kiểu Props/State/Event trong React, Type Narrowing, Generics, tiêu diệt `any` bằng `unknown` + Type Guard và đạt Type Coverage > 90%.',
    topics: [
      'Type vs Interface & Union/Literal types',
      'Định kiểu React Props, State & Event handlers',
      'Type narrowing (typeof, in, custom guards)',
      'Generics & Standard Utility Types (Pick, Omit, Record)',
      'TS Strict mode & Type coverage > 90%'
    ],
    codeSnippet: `// Khiên Type Guard chặn hoàn toàn lỗi runtime mà không dùng any
function isUserProfile(obj: unknown): obj is UserProfile {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}`,
    demoAction: '🛡️ Dựng Khiên Type Guard Diệt "any" (+150 EXP)',
    demoHandler: () => {
      awardRpgReward({
        expGain: 150,
        goldGain: 75,
        questCode: 'B6',
        reason: '[Ải B6] Khiên Type Guard đã thanh tẩy hoàn toàn từ khóa "any" (Coverage 96%)!'
      });
    }
  },
  B7: {
    icon: '⚡',
    bossName: 'Boss: Infinite Re-render Hydra',
    xpReward: 150,
    badge: 'Ải 7 (Hiện tại)',
    shortTitle: 'React Performance',
    title: 'Ải B7: Thung Lũng Tối Ưu Hiệu Năng & Custom Hooks',
    docPath: 'docs/B7_React_Advanced_Performance.md',
    summary:
      'Phong ấn các đợt re-render thừa bằng useMemo, useCallback, React.memo, đóng gói vũ khí Custom Hooks (useDebounce, useFetch) và phân tích Flamegraph.',
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
    demoAction: '⚡ Thi Triển Memoization 0ms (+150 EXP)',
    demoHandler: () => {
      awardRpgReward({
        expGain: 150,
        goldGain: 75,
        questCode: 'B7',
        reason: '[Ải B7] React.memo + useCallback đã chặn đứng 100% đợt re-render thừa của Hydra!'
      });
    }
  },
  B8: {
    icon: '💎',
    bossName: 'Boss: Prop-Drilling Golem',
    xpReward: 150,
    badge: 'Ải 8 (Hiện tại)',
    shortTitle: 'State Management',
    title: 'Ải B8: Kho Báu Zustand & Redux Toolkit',
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
    demoAction: '💎 Triệu Hồi Zustand & RTK Store (+150 EXP)',
    demoHandler: async () => {
      useAppStore.getState().addToCart({
        id: 'prod_' + Math.floor(Math.random() * 1000),
        name: 'Kiếm Ánh Sáng +' + (useAppStore.getState().cartItems.length + 1),
        price: 99
      });
      const cartCount = useAppStore.getState().getCartTotalCount();
      const totalPrice = useAppStore.getState().getCartTotalPrice();

      await reduxStore.dispatch(fetchProductsThunk(2));
      const rtkProducts = reduxStore.getState().products.items.length;

      awardRpgReward({
        expGain: 150,
        goldGain: 80,
        questCode: 'B8',
        reason: `[Ải B8] Zustand túi đồ: ${cartCount} vật phẩm ($${totalPrice}) | RTK Store: ${rtkProducts} items!`
      });
    }
  },
  B9: {
    icon: '🐉',
    bossName: 'Boss: Network Latency Dragon',
    xpReward: 200,
    badge: 'Ải 9 (Hiện tại)',
    shortTitle: 'TanStack Query',
    title: 'Ải B9: Đấu Trường Server State (TanStack Query v5)',
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
    demoAction: '🐉 Tung Đòn Optimistic Update 0ms (+200 EXP)',
    demoHandler: async () => {
      const demoKey = ['products', 'list', { page: 1 }];
      const query = queryClient.buildQuery({
        queryKey: demoKey,
        queryFn: async () => {
          await new Promise(r => setTimeout(r, 200));
          return [
            { id: 1, title: 'Giáp Rồng TanStack', price: 3499 },
            { id: 2, title: 'Cung Tên StaleTime', price: 210 }
          ];
        },
        staleTime: 5000
      });

      const t0 = performance.now();
      await query.fetch();
      const fetchDuration = Math.round(performance.now() - t0);

      queryClient.setQueryData(demoKey, old => [
        { id: 'temp-' + Date.now(), title: '⚡ Vũ Khí Lạc Quan (0ms)', price: 150 },
        ...(old || [])
      ]);
      const optimisticList = queryClient.getQueryData(demoKey);

      awardRpgReward({
        expGain: 200,
        goldGain: 100,
        questCode: 'B9',
        reason: `[Ải B9] Cache Miss: ${fetchDuration}ms -> Cache Hit: 0ms -> Optimistic UI: ${optimisticList.length} items!`
      });
    }
  },
  B10: {
    icon: '🌌',
    bossName: 'Boss: Hydration Phantom',
    xpReward: 200,
    badge: 'Ải 10 (Mới)',
    shortTitle: 'Next.js + TypeScript',
    title: 'Ải B10: Cổng Không Gian Next.js App Router + TypeScript',
    docPath: 'docs/B10_NextJS_TypeScript.md',
    summary:
      'Làm chủ Next.js 14/15 App Router, phân biệt React Server Components (RSC) vs Client Components ("use client"), chiến lược SSR/SSG/ISR, định kiểu TypeScript và Middleware Auth Guard.',
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
    demoAction: '🌌 Triệu Hồi Next.js RSC & Middleware (+200 EXP)',
    demoHandler: async () => {
      const rscMetrics = await simulateNextRenderingStrategy('RSC');
      const currentUser = useAppStore.getState().user;
      const mwCheck = nextAuthMiddleware.execute({
        pathname: '/dashboard/lessons-b4-b9',
        token: useAppStore.getState().token,
        policyAccepted: Boolean(currentUser?.policyAccepted)
      });
      await executeServerAction({
        email: currentUser?.email || 'intern@dev.vn',
        role: currentUser?.role || 'INTERN'
      });

      awardRpgReward({
        expGain: 200,
        goldGain: 100,
        questCode: 'B10',
        reason: `[Ải B10] Middleware [${mwCheck.status}] -> ${rscMetrics.name} (TTFB: ${rscMetrics.ttfbMs}ms, JS: ${rscMetrics.clientJsKb}kB)!`
      });
    }
  },
  B11: {
    icon: '📜',
    bossName: 'Boss: Unvalidated Payload Demon',
    xpReward: 200,
    badge: 'Ải 11 (Mới)',
    shortTitle: 'Form Handling + Policy',
    title: 'Ải B11: Tháp Kiểm Duyệt Form Handling (Hook Form + Zod)',
    docPath: 'docs/B11_Form_Handling.md',
    summary:
      'Xây dựng Form Đăng ký & Đăng nhập chuyên nghiệp với React Hook Form + Zod Schema Validation, kiểm tra khớp mật khẩu (.refine), đánh giá độ mạnh mật khẩu, nút tích chấp nhận Policy và Popup Chính sách đồng bộ 2 chiều.',
    topics: [
      'Uncontrolled Hook Form (useForm) tối ưu 0 lần re-render thừa',
      'Zod Schema Validation & tự động suy diễn kiểu z.infer<typeof schema>',
      'Cross-field validation (.refine) kiểm tra mật khẩu xác nhận',
      'Bắt buộc tích chọn Checkbox chấp nhận Policy (z.literal(true))',
      'Popup Chính sách bắt buộc lướt đọc xuống cuối mới hiện nút "Tôi Đồng Ý"'
    ],
    codeSnippet: `// Zod Schema với .refine() & bắt buộc tích chọn Policy
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(4),
  confirmPassword: z.string(),
  acceptPolicy: z.literal(true, {
    errorMap: () => ({ message: 'Phải tích đồng ý Chính sách!' })
  })
}).refine(d => d.password === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Mật khẩu xác nhận không khớp'
});`,
    demoAction: '📜 Mở Pháp Trận Chính Sách & Nhận +200 EXP',
    demoHandler: () => {
      awardRpgReward({
        expGain: 200,
        goldGain: 100,
        questCode: 'B11',
        reason: '[Ải B11] Kích hoạt Zod Schema Resolver & Mở Popup Chính sách!'
      });
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
      const isCleared = rpgState.clearedQuests.includes(key);
      return `
        <div data-quick-lesson="${key}"
          class="p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            isActive
              ? 'bg-indigo-600/20 border-indigo-400 shadow-xl scale-[1.01]'
              : 'bg-slate-100/70 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
          }">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ${item.icon} ${key}
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCleared
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }">
                ${isCleared ? '🏆 ĐÃ VƯỢT ẢI' : `+${item.xpReward} EXP`}
              </span>
            </div>
            <h4 class="font-bold text-sm text-slate-800 dark:text-white">${item.shortTitle}</h4>
            <p class="text-[11px] text-indigo-400 font-mono mt-0.5">${item.bossName}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">${item.summary}</p>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span class="font-bold text-indigo-600 dark:text-indigo-400">Vào Ải ${key} →</span>
            <a href="${item.docPath}" target="_blank" onclick="event.stopPropagation()"
              class="text-slate-400 hover:text-indigo-300 underline font-mono text-[11px]">Bí kíp .md</a>
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
  const isCleared = rpgState.clearedQuests.includes(lessonKey);

  if (docsBtn) docsBtn.href = lesson.docPath;

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
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge-tag">${lesson.icon} ${lessonKey} • ${lesson.bossName}</span>
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${
              isCleared
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }">
              ${isCleared ? '🏆 Đã Chinh Phục Ải Này' : `🎁 Thưởng Vượt Ải: +${lesson.xpReward} EXP`}
            </span>
          </div>
          <h3 class="text-2xl font-bold text-slate-800 dark:text-white mt-3">${lesson.title}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">${lesson.summary}</p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <strong class="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">🎯 Yêu Cầu Kỹ Năng Của Ải ${lessonKey}:</strong>
          <ul class="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            ${lesson.topics
              .map(
                t =>
                  `<li class="flex items-start gap-2"><span class="text-indigo-400 font-bold">⚔️</span><span>${t}</span></li>`
              )
              .join('')}
          </ul>
        </div>

        <div class="flex flex-wrap gap-3">
          <button id="run-demo-btn" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer">
            ${lesson.demoAction}
          </button>
          <a href="${lesson.docPath}" target="_blank" class="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            📖 Mở Bí Kíp Chi Tiết (${lesson.docPath})
          </a>
        </div>
      </div>

      <div class="lg:col-span-6">
        <div class="card-terminal h-full flex flex-col justify-between">
          <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <span class="text-xs font-mono text-indigo-300">📜 Cổ Thư Pháp Thuật (${lessonKey} Code Sample)</span>
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
            <small class="text-xs text-emerald-400 font-mono">✓ Bảo hộ bởi Next.js Auth Guard (B10)</small>
            <small class="text-xs text-amber-400 font-mono">${isCleared ? '🏆 Stage Cleared' : '⚡ Ready to Cast'}</small>
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
// 5. ĐẤU TRƯỜNG BOSS CUỐI: MENTOR Q&A QUIZ BATTLE
// ============================================================================

const bossQuizQuestions = [
  {
    badge: 'Đòn Khảo Nghiệm B6 (TypeScript)',
    question: 'Khi nhận dữ liệu JSON chưa rõ kiểu từ API, chiến binh nên dùng kiểu nào thay cho `any` để đảm bảo Type Safety?',
    options: [
      'A. Dùng `unknown` kết hợp với Type Guard hoặc Zod Schema',
      'B. Dùng `Object` hoặc `Function` cho nhanh',
      'C. Tắt chế độ `"strict": false` trong tsconfig.json'
    ],
    correctIdx: 0,
    explanation: 'Chính xác! `unknown` bắt buộc kiểm tra kiểu (Type Narrowing / Guard) trước khi truy cập thuộc tính.'
  },
  {
    badge: 'Đòn Khảo Nghiệm B9 (TanStack Query)',
    question: 'Trong kỹ thuật Optimistic Updates (`useMutation`), nếu API trả về lỗi 500 thì ta khôi phục dữ liệu cũ ở callback nào?',
    options: [
      'A. Tự động gọi `window.location.reload()`',
      'B. Trong `onError`, dùng bản chụp `context.previousData` trả về từ `onMutate`',
      'C. Xóa toàn bộ LocalStorage'
    ],
    correctIdx: 1,
    explanation: 'Tuyệt vời! Snapshot lưu tại `onMutate` giúp rollback chính xác trạng thái Cache trong `onError`.'
  },
  {
    badge: 'Đòn Khảo Nghiệm B10 (Next.js App Router)',
    question: 'Trong Next.js App Router, khi nào chúng ta bắt buộc phải khai báo directive `"use client"` ở đầu file?',
    options: [
      'A. Ở tất cả mọi file trong thư mục `app/`',
      'B. Khi chỉ cần fetch dữ liệu tĩnh trên Server',
      'C. Khi Component cần dùng React Hooks (`useState`, `useEffect`, `useForm`) hoặc sự kiện DOM (`onClick`)'
    ],
    correctIdx: 2,
    explanation: 'Đòn chí mạng! Chỉ gắn `"use client"` cho các Component cần tính tương tác trình duyệt.'
  },
  {
    badge: 'Đòn Khảo Nghiệm B11 (Form Handling + Zod)',
    question: 'Để kiểm tra `confirmPassword === password` và bắt buộc tích chọn Checkbox Policy trong Zod, ta dùng phương thức nào?',
    options: [
      'A. Dùng `.refine()` cho đối chiếu mật khẩu và `z.literal(true)` cho ô tích Policy',
      'B. Chỉ dùng thuộc tính HTML `required` là đủ',
      'C. Không thể kiểm tra 2 trường phụ thuộc nhau trong Zod'
    ],
    correctIdx: 0,
    explanation: 'Chuẩn xác 100%! `.refine()` kết hợp `path: ["confirmPassword"]` là chuẩn mực vàng trong React Hook Form + Zod.'
  }
];

function renderBossQuiz() {
  const card = document.querySelector('#boss-quiz-card');
  const hpText = document.querySelector('#boss-hp-text');
  const hpBar = document.querySelector('#boss-hp-bar');
  const statusNote = document.querySelector('#boss-status-note');

  if (hpText) hpText.textContent = `${rpgState.bossHp} / 100 HP`;
  if (hpBar) hpBar.style.width = `${rpgState.bossHp}%`;

  if (!card) return;

  if (rpgState.bossHp <= 0) {
    if (statusNote) {
      statusNote.textContent = '🎉 "Khá lắm! Cậu đã nắm vững toàn bộ kiến thức từ B4 đến B11. Xứng đáng 10 điểm!"';
    }
    card.innerHTML = `
      <div class="text-center py-6 space-y-4">
        <div class="text-5xl">👑</div>
        <h3 class="text-2xl font-extrabold text-amber-400">CHIẾN THẮNG ĐẠI BOSS MENTOR!</h3>
        <p class="text-sm text-slate-300">
          Bạn đã trả lời xuất sắc tất cả các câu hỏi phản biện từ <strong>B4 — B11</strong> và nhận danh hiệu <strong>Grandmaster Frontend Intern</strong>!
        </p>
        <button id="revive-boss-btn" type="button"
          class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer">
          🔄 Khiêu Chiến Lại Đại Boss
        </button>
      </div>
    `;
    document.querySelector('#revive-boss-btn')?.addEventListener('click', () => {
      rpgState.bossHp = 100;
      rpgState.currentQuizIdx = 0;
      saveRpgState();
      renderBossQuiz();
    });
    return;
  }

  const q = bossQuizQuestions[rpgState.currentQuizIdx % bossQuizQuestions.length];

  card.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
        ${q.badge}
      </span>
      <span class="text-xs font-mono text-slate-400">Câu hỏi ${(rpgState.currentQuizIdx % bossQuizQuestions.length) + 1} / ${bossQuizQuestions.length}</span>
    </div>
    <h3 class="text-base sm:text-lg font-bold text-white leading-snug">${q.question}</h3>
    <div class="space-y-2.5" id="boss-quiz-options">
      ${q.options
        .map(
          (opt, idx) => `
          <button type="button" data-opt-idx="${idx}"
            class="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-400 text-xs sm:text-sm text-slate-200 font-medium transition-all cursor-pointer">
            ${escapeHtml(opt)}
          </button>
        `
        )
        .join('')}
    </div>
    <p id="boss-quiz-feedback" class="hidden text-xs font-semibold pt-1"></p>
  `;

  card.querySelectorAll('button[data-opt-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = Number(btn.getAttribute('data-opt-idx'));
      const feedback = document.querySelector('#boss-quiz-feedback');

      if (chosen === q.correctIdx) {
        rpgState.bossHp = Math.max(0, rpgState.bossHp - 25);
        rpgState.currentQuizIdx += 1;
        awardRpgReward({
          expGain: 150,
          goldGain: 80,
          reason: `Đòn chí mạng! Trả lời đúng câu hỏi phỏng vấn (-25 HP Boss)`
        });
        renderBossQuiz();
      } else {
        if (feedback) {
          feedback.className = 'text-xs font-semibold pt-1 text-rose-400';
          feedback.textContent = '❌ Chưa chính xác! Hãy đọc kỹ lại kiến thức của Ải và chọn đáp án khác nhé.';
          feedback.classList.remove('hidden');
        }
      }
    });
  });
}

// ============================================================================
// 6. POPUP CHÍNH SÁCH & ĐIỀU KHOẢN (LƯỚT XUỐNG CUỐI MỚI HIỆN NÚT "TÔI ĐỒNG Ý")
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
        <strong>📌 Xác nhận cuối văn bản:</strong> Tôi xác nhận đã đọc toàn bộ các điều khoản từ Điều 1 đến Điều 6, cam kết viết code chuẩn TypeScript, validate đầy đủ mọi Form trước khi gửi và hoàn thành trọn vẹn lộ trình thực tập!
      </div>
    `;
}

function resetPolicyModalScrollState() {
  const container = document.querySelector('#policy-clauses-list');
  const acceptBtn = document.querySelector('#accept-policy-modal-btn');
  const scrollHint = document.querySelector('#policy-scroll-hint');

  if (container) {
    container.scrollTop = 0;
  }
  if (acceptBtn) {
    acceptBtn.hidden = true;
    acceptBtn.classList.add('hidden');
  }
  if (scrollHint) {
    scrollHint.className = 'text-xs text-amber-300 font-medium flex items-center gap-1.5';
    scrollHint.textContent = '⬇️ Vui lòng lướt xuống cuối Chính sách để hiện nút "Tôi Đồng Ý"';
  }
}

function handlePolicyScrollCheck() {
  const container = document.querySelector('#policy-clauses-list');
  const acceptBtn = document.querySelector('#accept-policy-modal-btn');
  const scrollHint = document.querySelector('#policy-scroll-hint');
  if (!container || !acceptBtn) return;

  const { scrollTop, clientHeight, scrollHeight } = container;
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 16;

  if (isAtBottom) {
    acceptBtn.hidden = false;
    acceptBtn.classList.remove('hidden');
    if (scrollHint) {
      scrollHint.className = 'text-xs text-emerald-400 font-bold flex items-center gap-1.5';
      scrollHint.textContent = '✅ Đã đọc hết Chính sách! Bấm "Tôi Đồng Ý" để xác nhận và ẩn Popup.';
    }
  }
}

document.querySelector('#policy-clauses-list')?.addEventListener('scroll', handlePolicyScrollCheck);

function openPolicyModal() {
  const modal = document.querySelector('#policy-modal');
  if (modal) {
    modal.hidden = false;
    modal.classList.remove('hidden');
    resetPolicyModalScrollState();
  }
}

function closePolicyModal() {
  const modal = document.querySelector('#policy-modal');
  if (modal) {
    modal.hidden = true;
    modal.classList.add('hidden');
  }
}

document.querySelector('#open-policy-modal-link')?.addEventListener('click', openPolicyModal);
document.querySelector('#open-policy-preview-btn')?.addEventListener('click', openPolicyModal);
document.querySelector('#nav-open-policy-btn')?.addEventListener('click', openPolicyModal);
document.querySelector('#close-policy-modal-x')?.addEventListener('click', closePolicyModal);
document.querySelector('#close-policy-modal-btn')?.addEventListener('click', closePolicyModal);

document.querySelector('#policy-modal')?.addEventListener('click', e => {
  if (e.target.id === 'policy-modal') {
    closePolicyModal();
  }
});

document.querySelector('#accept-policy-modal-btn')?.addEventListener('click', () => {
  const policyCheckbox = document.querySelector('#input-accept-policy');
  if (policyCheckbox) {
    policyCheckbox.checked = true;
    syncPolicyCheckboxUI();
  }
  closePolicyModal();
  showAuthBanner(
    'success',
    '✅ Bạn đã đọc đến cuối và đồng ý với Chính sách Học viên! Ô tích chọn Policy đã được bật tự động.'
  );
});

// ============================================================================
// 7. TRANG ĐĂNG KÝ / ĐĂNG NHẬP NHÂN VẬT & FORM HANDLING (B10 & B11)
// ============================================================================

let authMode = 'login'; // 'login' | 'register'

function setAuthMode(mode) {
  authMode = mode;

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
    if (submitText) submitText.textContent = '✨ Khởi Tạo Nhân Vật & Vào Bản Đồ Bài Tập (B4 — B9)';
    if (switchLink) switchLink.textContent = 'Đã có nhân vật? Bấm vào đây để chuyển về Đăng Nhập →';
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
    if (submitText) submitText.textContent = '⚔️ Tiến Vào Bản Đồ Bài Tập (B4 — B9)';
    if (switchLink) switchLink.textContent = 'Chưa có nhân vật? Bấm vào đây để chuyển sang Đăng Ký Tài Khoản mới →';
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

document.querySelector('#fill-demo-btn')?.addEventListener('click', () => {
  const demo = getDemoCredentials();
  const fullNameEl = document.querySelector('#input-fullname');
  const emailEl = document.querySelector('#input-email');
  const roleEl = document.querySelector('#input-role');
  const passEl = document.querySelector('#input-password');
  const confirmEl = document.querySelector('#input-confirm-password');
  const policyEl = document.querySelector('#input-accept-policy');

  if (fullNameEl) fullNameEl.value = demo.fullName;
  if (emailEl) {
    emailEl.value =
      authMode === 'register'
        ? `thinh.hero.${Math.floor(Math.random() * 90 + 10)}@dev.vn`
        : demo.email;
  }
  if (roleEl) roleEl.value = demo.role;
  if (passEl) passEl.value = demo.password;
  if (confirmEl) confirmEl.value = demo.password;
  if (policyEl) policyEl.checked = true;

  updatePasswordMeter(demo.password);
  syncPolicyCheckboxUI();
  clearAllFieldErrors();
  showAuthBanner(
    'info',
    '⚡ Đã triệu hồi thông tin Chiến Binh Demo và tích chọn đồng ý Policy! Bấm nút bên dưới để vào chinh phục các ải từ B4 — B9.'
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

document.querySelector('#auth-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const values = getFormValues();

  const validation =
    authMode === 'login' ? validateLoginSchema(values) : validateRegisterSchema(values);

  if (!validation.success) {
    renderFieldErrors(validation.errors);
    const firstErrorMsg = Object.values(validation.errors)[0];
    showAuthBanner('error', `⚠️ ${firstErrorMsg}`);
    return;
  }

  clearAllFieldErrors();

  const result =
    authMode === 'login'
      ? authenticateUserAccount(validation.data)
      : registerNewUserAccount(validation.data);

  if (!result.ok) {
    renderFieldErrors({ [result.field]: result.message });
    showAuthBanner('error', result.message);
    return;
  }

  useAppStore.getState().login(result.user, result.token);
  nextAuthMiddleware.execute({
    pathname: '/dashboard',
    token: result.token,
    policyAccepted: true
  });

  syncAuthView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================================================
// 8. ĐIỀU HƯỚNG GIỮA CỔNG HIỆP HỘI VÀ BẢN ĐỒ CHIẾN DỊCH B4-B9
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

    const nameEl = document.querySelector('#nav-user-name');
    const heroCardName = document.querySelector('#hero-card-name');
    const emailEl = document.querySelector('#nav-user-email');
    const roleEl = document.querySelector('#nav-user-role');
    const avatarIcon = document.querySelector('#hud-avatar-icon');

    const roleIcons = { INTERN: '⚔️', DEVELOPER: '🔮', MENTOR: '🛡️' };
    const icon = roleIcons[user.role] || '⚔️';

    if (nameEl) nameEl.textContent = user.name || 'Thịnh Intern';
    if (heroCardName) heroCardName.textContent = user.name || 'Thịnh Intern';
    if (emailEl) emailEl.textContent = user.email || 'intern@dev.vn';
    if (roleEl) roleEl.textContent = `${icon} ${user.role || 'INTERN'}`;
    if (avatarIcon) avatarIcon.textContent = icon;

    renderRpgHud();
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

document.querySelector('#logout-btn')?.addEventListener('click', () => {
  useAppStore.getState().logout();
  syncAuthView();
  showAuthBanner(
    'info',
    '👋 Chiến binh đã rời Hiệp hội. Hãy tích chọn chấp nhận Policy và đăng nhập lại để vào Bản đồ các ải từ B4 — B9!'
  );
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================================================
// 9. INITIALIZE APPLICATION
// ============================================================================

renderPolicyModalClauses();
renderTasks();
updateProgress();
renderUsers();
renderRpgHud();
renderLessonPanel('B4');
renderBossQuiz();
updateFormInspector();
syncAuthView();
