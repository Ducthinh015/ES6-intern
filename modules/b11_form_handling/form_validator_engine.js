// ============================================================================
// B11 / DEV-FE-011: FORM HANDLING ENGINE (REACT HOOK FORM + ZOD SIMULATOR)
// Schema Validation, Cross-Field Refinement (Confirm Password), Policy Checkbox
// Validation, Password Strength Meter & Local Auth Database
// ============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * 1. Đánh giá độ mạnh của mật khẩu (Password Strength Analyzer)
 */
export function evaluatePasswordStrength(password = '') {
  if (!password) {
    return { score: 0, label: 'Chưa nhập', color: 'bg-slate-600', textColor: 'text-slate-400' };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  const levels = [
    { score: 0, label: 'Rất yếu', color: 'bg-red-500', textColor: 'text-red-400' },
    { score: 1, label: 'Yếu (Cần ≥ 6 ký tự)', color: 'bg-red-500', textColor: 'text-red-400' },
    { score: 2, label: 'Trung bình', color: 'bg-amber-500', textColor: 'text-amber-400' },
    { score: 3, label: 'Khá mạnh', color: 'bg-indigo-500', textColor: 'text-indigo-400' },
    { score: 4, label: 'Rất mạnh (Chuẩn bảo mật)', color: 'bg-emerald-500', textColor: 'text-emerald-400' }
  ];

  return levels[Math.min(score, 4)];
}

/**
 * 2. Zod-style Schema Validator cho Form Đăng Nhập (Login Schema)
 */
export function validateLoginSchema(values) {
  const errors = {};

  // Validate Email
  const email = (values.email || '').trim();
  if (!email) {
    errors.email = 'Vui lòng nhập địa chỉ Email của bạn.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Định dạng Email không hợp lệ (ví dụ: intern@dev.vn).';
  }

  // Validate Password
  const password = values.password || '';
  if (!password) {
    errors.password = 'Vui lòng nhập mật khẩu.';
  } else if (password.length < 6) {
    errors.password = 'Mật khẩu phải có tối thiểu 6 ký tự.';
  }

  // Validate Policy Checkbox (Bắt buộc!)
  if (!values.acceptPolicy) {
    errors.acceptPolicy = 'Bạn bắt buộc phải đọc và tích chọn đồng ý với Chính sách Học viên & Bảo mật!';
  }

  return {
    success: Object.keys(errors).length === 0,
    data: Object.keys(errors).length === 0 ? { ...values, email } : null,
    errors
  };
}

/**
 * 3. Zod-style Schema Validator cho Form Đăng Ký (Register Schema + .refine Confirm Password)
 */
export function validateRegisterSchema(values) {
  const errors = {};

  // Validate Full Name
  const fullName = (values.fullName || '').trim();
  if (!fullName) {
    errors.fullName = 'Vui lòng nhập họ và tên đầy đủ.';
  } else if (fullName.length < 3) {
    errors.fullName = 'Họ và tên phải có ít nhất 3 ký tự.';
  }

  // Validate Email
  const email = (values.email || '').trim();
  if (!email) {
    errors.email = 'Vui lòng nhập địa chỉ Email.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Định dạng Email không hợp lệ (ví dụ: thinh.intern@dev.vn).';
  }

  // Validate Role
  const validRoles = ['INTERN', 'DEVELOPER', 'MENTOR'];
  if (!values.role || !validRoles.includes(values.role)) {
    errors.role = 'Vui lòng chọn vai trò hợp lệ.';
  }

  // Validate Password
  const password = values.password || '';
  if (!password) {
    errors.password = 'Vui lòng tạo mật khẩu.';
  } else if (password.length < 6) {
    errors.password = 'Mật khẩu phải chứa tối thiểu 6 ký tự.';
  } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Mật khẩu phải bao gồm cả chữ cái và chữ số.';
  }

  // Cross-field Validation (.refine): Confirm Password === Password
  const confirmPassword = values.confirmPassword || '';
  if (!confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu.';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập.';
  }

  // Validate Policy Acceptance Checkbox (z.literal(true))
  if (!values.acceptPolicy) {
    errors.acceptPolicy = 'Bạn phải tích chọn chấp nhận Chính sách Học viên & Quy định Hệ thống để tạo tài khoản!';
  }

  return {
    success: Object.keys(errors).length === 0,
    data: Object.keys(errors).length === 0 ? { fullName, email, role: values.role, password, acceptPolicy: true } : null,
    errors
  };
}

/**
 * 4. Nội dung Chính sách tự chế (Custom Policy Data cho Popup)
 */
export const CUSTOM_POLICY_CLAUSES = [
  {
    id: 'clause-1',
    code: 'ĐIỀU 1',
    title: 'Đạo luật "Zero Any" trong TypeScript & Next.js (B6 & B10)',
    badge: 'Bắt buộc',
    content:
      'Học viên cam kết không lạm dụng từ khóa `any` dưới mọi hình thức. Khi làm việc với dữ liệu chưa rõ kiểu từ API hoặc Form, bắt buộc phải dùng `unknown` kết hợp với Type Guard hoặc Zod Schema để đạt Type Coverage > 90%.'
  },
  {
    id: 'clause-2',
    code: 'ĐIỀU 2',
    title: 'Phân tách rạch ròi Server Component & Client Component (B10)',
    badge: 'Next.js App Router',
    content:
      'Chỉ gắn directive `"use client"` cho những Component thực sự cần tương tác trình duyệt (useState, useEffect, React Hook Form, onClick). Các phần đọc dữ liệu tĩnh hoặc SEO phải ưu tiên giữ ở React Server Component để giảm tải JS Bundle.'
  },
  {
    id: 'clause-3',
    code: 'ĐIỀU 3',
    title: 'Quy chuẩn Quản lý State & Caching (B8 & B9)',
    badge: 'Performance',
    content:
      'Không lưu trữ dữ liệu Server (danh sách sản phẩm, bài viết) một cách thủ công vào Zustand/Redux thông qua useEffect. Phải sử dụng TanStack Query (useQuery, useMutation, Optimistic Updates) cho Server State và Zustand Persist cho Client/Auth State.'
  },
  {
    id: 'clause-4',
    code: 'ĐIỀU 4',
    title: 'Chuẩn hóa Form Handling & Bảo vệ Người dùng (B11)',
    badge: 'Security & UX',
    content:
      'Mọi biểu mẫu Đăng ký, Đăng nhập và Nhập liệu phải đi qua lớp kiểm duyệt Schema (Zod + React Hook Form). Không được phép gửi dữ liệu thô chưa validate lên Server Action hay REST API. Luôn hiển thị thông báo lỗi rõ ràng ngay dưới từng trường.'
  },
  {
    id: 'clause-5',
    code: 'ĐIỀU 5',
    title: 'Quyền truy cập Kho Bài Tập Thực Hành (B4 — B9 & B10 — B11)',
    badge: 'Quyền lợi Học viên',
    content:
      'Ngay sau khi tích chọn chấp nhận Chính sách này và Đăng nhập thành công, hệ thống Next.js Auth Guard sẽ mở khóa toàn bộ kho bài tập từ Bài 4 đến Bài 9 (kèm Bài 10 & Bài 11), cho phép chạy trực tiếp các bộ mô phỏng và xem tài liệu báo cáo chi tiết.'
  }
];

/**
 * 5. Quản lý User Database giả lập trên LocalStorage (Hỗ trợ Đăng ký mới & Đăng nhập thật)
 */
const USERS_STORAGE_KEY = 'fe_intern_users_db_v1';

const DEFAULT_DEMO_USER = {
  id: 'usr_demo_001',
  fullName: 'Thịnh Intern (FE Developer)',
  email: 'intern@dev.vn',
  password: 'Password123',
  role: 'INTERN',
  policyAcceptedAt: '2026-11-06T08:00:00.000Z'
};

export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_DEMO_USER]));
      return [DEFAULT_DEMO_USER];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_DEMO_USER];
  } catch {
    return [DEFAULT_DEMO_USER];
  }
}

export function registerNewUserAccount({ fullName, email, password, role }) {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return {
      ok: false,
      field: 'email',
      message: 'Email này đã được đăng ký! Vui lòng chuyển sang tab Đăng nhập hoặc dùng Email khác.'
    };
  }

  const newUser = {
    id: 'usr_' + Date.now().toString(36),
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: role || 'INTERN',
    policyAcceptedAt: new Date().toISOString()
  };

  const updated = [newUser, ...users];
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Không thể lưu user vào localStorage:', err);
  }

  return {
    ok: true,
    user: {
      id: newUser.id,
      name: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      policyAccepted: true,
      policyAcceptedAt: newUser.policyAcceptedAt
    },
    token: 'nextjs_jwt_' + btoa(newUser.email + ':' + Date.now())
  };
}

export function authenticateUserAccount({ email, password }) {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const matched = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!matched) {
    return {
      ok: false,
      field: 'email',
      message: 'Không tìm thấy tài khoản với Email này. Bạn có thể bấm "Điền nhanh Demo" hoặc chuyển sang Đăng ký mới!'
    };
  }

  if (matched.password !== password) {
    return {
      ok: false,
      field: 'password',
      message: 'Mật khẩu không chính xác. (Tài khoản demo mặc định: Password123)'
    };
  }

  return {
    ok: true,
    user: {
      id: matched.id,
      name: matched.fullName,
      email: matched.email,
      role: matched.role,
      policyAccepted: true,
      policyAcceptedAt: new Date().toISOString()
    },
    token: 'nextjs_jwt_' + btoa(matched.email + ':' + Date.now())
  };
}

export function getDemoCredentials() {
  return {
    fullName: DEFAULT_DEMO_USER.fullName,
    email: DEFAULT_DEMO_USER.email,
    password: DEFAULT_DEMO_USER.password,
    role: DEFAULT_DEMO_USER.role
  };
}

