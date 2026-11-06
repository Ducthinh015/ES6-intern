// ============================================================================
// B11 / DEV-FE-011: REACT HOOK FORM + ZOD SCHEMA VALIDATION (TYPESCRIPT)
// Minh họa chuẩn doanh nghiệp: useForm, zodResolver, Cross-Field .refine() & Policy Popup
// ============================================================================

'use client';

import React, { useState } from 'react';
// Trong dự án Next.js thực tế:
// import { useForm, SubmitHandler } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';

// ----------------------------------------------------------------------------
// 1. ĐỊNH NGHĨA ZOD SCHEMA & SUY DIỄN KIỂU TỰ ĐỘNG (z.infer)
// ----------------------------------------------------------------------------

/*
export const registerFormSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Họ và tên phải có ít nhất 3 ký tự')
      .max(60, 'Họ và tên không vượt quá 60 ký tự'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập địa chỉ Email')
      .email('Định dạng Email không hợp lệ'),
    role: z.enum(['INTERN', 'DEVELOPER', 'MENTOR'], {
      errorMap: () => ({ message: 'Vui lòng chọn vai trò hợp lệ' })
    }),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự')
      .regex(/[A-Za-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ cái')
      .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu'),
    acceptPolicy: z.literal(true, {
      errorMap: () => ({
        message: 'Bạn bắt buộc phải đọc và đồng ý với Chính sách Học viên & Bảo mật!'
      })
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'] // Gắn lỗi chính xác vào trường confirmPassword
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
*/

export interface RegisterFormValues {
  fullName: string;
  email: string;
  role: 'INTERN' | 'DEVELOPER' | 'MENTOR';
  password: string;
  confirmPassword: string;
  acceptPolicy: boolean;
}

// ----------------------------------------------------------------------------
// 2. COMPONENT ĐĂNG KÝ KÈM POPUP CHÍNH SÁCH ĐỒNG BỘ 2 CHIỀU VỚI FORM STATE
// ----------------------------------------------------------------------------

export function RegisterFormWithPolicyModal({
  onSuccessLogin
}: {
  onSuccessLogin: (user: Omit<RegisterFormValues, 'password' | 'confirmPassword'>) => void;
}) {
  const [isPolicyOpen, setIsPolicyOpen] = useState<boolean>(false);

  // Mô phỏng state trả về từ useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) })
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    fullName: '',
    email: '',
    role: 'INTERN',
    password: '',
    confirmPassword: '',
    acceptPolicy: false
  });

  // Khi người dùng bấm "Tôi Đồng Ý" từ bên trong Popup Chính sách -> Tự động tích checkbox trên Form!
  const handleAcceptPolicyFromPopup = () => {
    setFormValues(prev => ({ ...prev, acceptPolicy: true }));
    setIsPolicyOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formValues.acceptPolicy) return;
    onSuccessLogin({
      fullName: formValues.fullName,
      email: formValues.email,
      role: formValues.role,
      acceptPolicy: formValues.acceptPolicy
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Họ và tên</label>
          <input
            type="text"
            value={formValues.fullName}
            onChange={e => setFormValues({ ...formValues, fullName: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id="acceptPolicy"
            type="checkbox"
            checked={formValues.acceptPolicy}
            onChange={e => setFormValues({ ...formValues, acceptPolicy: e.target.checked })}
          />
          <label htmlFor="acceptPolicy" className="text-xs text-slate-300">
            Tôi đã đọc và đồng ý với{' '}
            <button
              type="button"
              onClick={() => setIsPolicyOpen(true)}
              className="text-indigo-400 underline font-semibold"
            >
              Chính sách & Điều khoản Học viên
            </button>
          </label>
        </div>

        <button type="submit" className="w-full py-2.5 bg-indigo-600 rounded-xl font-bold">
          Đăng ký & Mở khóa Bài tập B4 - B9
        </button>
      </form>

      {isPolicyOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold">Chính Sách Học Viên Frontend</h3>
            <p className="text-sm text-slate-400 my-4">
              Cam kết tuân thủ TypeScript Strict Mode, sử dụng React Hook Form + Zod để kiểm duyệt dữ liệu...
            </p>
            <button
              type="button"
              onClick={handleAcceptPolicyFromPopup}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold"
            >
              Tôi đã đọc hiểu & Đồng ý Chính sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

