// B4: Controlled Form Input & Lifting State Up Demo

import React, { useState } from 'react';

/**
 * Controlled Form Component
 */
export function ControlledForm({ onSubmitData }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    agreed: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.email) return alert('Vui lòng điền đầy đủ thông tin');
    onSubmitData(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-xl bg-white dark:bg-slate-800">
      <h5 className="font-bold">Controlled Form Input</h5>
      <div>
        <label className="block text-xs font-semibold mb-1">Username</label>
        <input 
          type="text" 
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full px-3 py-1.5 border rounded text-sm dark:bg-slate-900"
          placeholder="Nhập tên đăng nhập..."
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Email</label>
        <input 
          type="email" 
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-3 py-1.5 border rounded text-sm dark:bg-slate-900"
          placeholder="user@example.com"
        />
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          name="agreed"
          id="agreed"
          checked={form.agreed}
          onChange={handleChange}
        />
        <label htmlFor="agreed" className="text-xs">Đồng ý với điều khoản</label>
      </div>

      <button 
        type="submit" 
        className="w-full py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700"
      >
        Gửi Dữ Liệu Form
      </button>
    </form>
  );
}
