# BÁO CÁO BÀI TẬP HỌC VIÊN — B4: REACT FUNDAMENTALS

**Học viên thực hiện:** Intern Developer  
**Trạng thái:** đã hoàn thành 100% các bài tập  
**Mã bài tập:** FE-004 / B4  

---

## 1. Bài Tập 1: JSX & Component Architecture

### Đề bài:
Xây dựng cây Component phân tách rõ ràng trách nhiệm: `App` -> `UserList` -> `UserCard`.

### Lời giải / Code thực hiện (`src/components/UserCard.jsx`):

```jsx
import React from 'react';

// Component hiển thị thông tin từng User (Pure Presentation Component)
export function UserCard({ id, name, email, role, status, onDelete }) {
  return (
    <div className="user-card p-4 border rounded-xl bg-white dark:bg-slate-800 shadow-sm flex justify-between items-center">
      <div>
        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{name}</h4>
        <p className="text-sm text-slate-500">{email}</p>
        <div className="mt-2 flex gap-2">
          <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
            {role}
          </span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
            status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {status}
          </span>
        </div>
      </div>
      <button 
        onClick={() => onDelete(id)}
        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg"
      >
        Xóa
      </button>
    </div>
  );
}
```

---

## 2. Bài Tập 2: useState & useEffect (3 Dạng)

### Đề bài:
Thực hiện Component `UserProfileManager` sử dụng `useState` để lưu dữ liệu và `useEffect` xử lý:
1. Log mỗi lần render.
2. Fetch dữ liệu khi mount.
3. Sync document title theo tên user được chọn.
4. Cleanup timer khi unmount.

### Lời giải / Code thực hiện:

```jsx
import React, { useState, useEffect } from 'react';

export function UserProfileManager() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [seconds, setSeconds] = useState(0);

  // 1. Dạng 1: Không deps - Log mỗi lần component re-render
  useEffect(() => {
    console.log('[Lifecycle] UserProfileManager đã re-render.');
  });

  // 2. Dạng 2: Deps rỗng [] - Chạy 1 lần duy nhất khi Mount (Fetch API giả lập)
  useEffect(() => {
    console.log('[Lifecycle] Component Mounted -> Fetching initial users...');
    const initialData = [
      { id: 'u1', name: 'Nguyễn Văn A', email: 'a@company.com', role: 'Dev', status: 'active' },
      { id: 'u2', name: 'Trần Thị B', email: 'b@company.com', role: 'Designer', status: 'active' }
    ];
    setUsers(initialData);
  }, []);

  // 3. Dạng 3: Theo dõi [selectedUser] - Cập nhật document title
  useEffect(() => {
    if (selectedUser) {
      document.title = `Đang xem: ${selectedUser.name}`;
    } else {
      document.title = 'Quản lý người dùng';
    }
  }, [selectedUser]);

  // 4. Cleanup Function - Hủy setInterval khi Unmount
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      console.log('[Cleanup] Đã xóa timer interval.');
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
      <p className="text-xs text-slate-400 mb-2">Thời gian đã xem: {seconds} giây</p>
      <div className="space-y-2">
        {users.map(u => (
          <div 
            key={u.id} 
            onClick={() => setSelectedUser(u)}
            className={`p-3 rounded-lg cursor-pointer border ${selectedUser?.id === u.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200'}`}
          >
            <strong>{u.name}</strong> - {u.role}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. Bài Tập 3: Render Danh Sách, Key & Conditional Rendering

### Đề bài:
Render danh sách bài tập Todo với tính năng lọc (Tất cả / Hoàn thành / Chưa hoàn thành) và giải thích tại sao phải dùng `key` độc nhất.

### Lời giải / Code thực hiện:

```jsx
import React, { useState } from 'react';

export function TodoListApp() {
  const [todos, setTodos] = useState([
    { id: 'todo-1', text: 'Học JSX và Component', completed: true },
    { id: 'todo-2', text: 'Làm bài tập Controlled Form', completed: false },
    { id: 'todo-3', text: 'Thực hành Lifting State Up', completed: false }
  ]);
  const [filter, setFilter] = useState('all');

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Conditional Filtering
  const filteredTodos = todos.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'active') return !t.completed;
    return true;
  });

  return (
    <div className="p-5 border rounded-2xl bg-white dark:bg-slate-800">
      <h3 className="font-bold text-lg mb-4">Danh Sách Công Việc</h3>
      
      {/* Bộ Lọc */}
      <div className="flex gap-2 mb-4">
        {['all', 'active', 'completed'].map(mode => (
          <button 
            key={mode} 
            onClick={() => setFilter(mode)}
            className={`px-3 py-1 rounded text-xs capitalize ${filter === mode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Conditional Rendering: Kiểm tra nếu danh sách rỗng */}
      {filteredTodos.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">Không có công việc nào!</p>
      ) : (
        <ul className="space-y-2">
          {filteredTodos.map(item => (
            // Bắt buộc dùng item.id độc nhất làm key
            <li 
              key={item.id}
              onClick={() => toggleTodo(item.id)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${item.completed ? 'line-through opacity-60 bg-slate-50' : 'bg-white'}`}
            >
              <span>{item.text}</span>
              <span className="text-xs">{item.completed ? '✓ Đã xong' : '⏳ Đang làm'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

#### ❓ Giải trình lý do sử dụng Key độc nhất (`item.id`):
- React sử dụng thuật toán Virtual DOM Diffing để so sánh cây DOM cũ và mới.
- Nhờ có `key`, React biết chính xác phần tử nào bị sửa, thêm hoặc xóa trong danh sách.
- Nếu dùng `index` của mảng làm `key`, khi thêm/xóa phần tử ở đầu mảng, React sẽ re-render nhầm toàn bộ các phần tử phía sau, gây ra bug state trên giao diện.

---

## 4. Bài Tập 4: Controlled Form Input & Lifting State Up

### Đề bài:
Xây dựng Form thêm thành viên (Controlled Input) và nâng State lên Component cha chung `UserManagementParent` để hiển thị danh sách realtime.

### Lời giải / Code thực hiện:

```jsx
import React, { useState } from 'react';

// Component Con 1: Controlled Form Input
function AddUserForm({ onAddUser }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'INTERN'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return alert('Vui lòng điền đủ thông tin!');
    
    // Gọi callback từ component cha (Lifting State Up)
    onAddUser({ ...formData, id: Date.now().toString() });
    
    // Reset Form State
    setFormData({ name: '', email: '', role: 'INTERN' });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-xl space-y-3 bg-slate-50 dark:bg-slate-900">
      <h4 className="font-bold text-sm">Thêm Học Viên Mới</h4>
      <input 
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Họ và tên..."
        className="w-full p-2 text-sm border rounded"
      />
      <input 
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email..."
        className="w-full p-2 text-sm border rounded"
      />
      <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 text-sm border rounded">
        <option value="INTERN">INTERN</option>
        <option value="DEVELOPER">DEVELOPER</option>
        <option value="MENTOR">MENTOR</option>
      </select>
      <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded font-bold text-sm">Thêm Vào Danh Sách</button>
    </form>
  );
}

// Component Cha: Quản lý State chung (Lifting State Up Container)
export function UserManagementParent() {
  const [userList, setUserList] = useState([]);

  const handleAddUser = (newUser) => {
    setUserList(prev => [...prev, newUser]);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <AddUserForm onAddUser={handleAddUser} />
      <div className="p-4 border rounded-xl bg-white dark:bg-slate-800">
        <h4 className="font-bold text-sm mb-3">Danh Sách Học Viên ({userList.length})</h4>
        {userList.map(u => (
          <div key={u.id} className="p-2 mb-2 bg-slate-100 dark:bg-slate-700 rounded text-xs">
            <strong>{u.name}</strong> ({u.role}) - {u.email}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Phân Tích Cơ Chế Re-render & Lifecycle Vòng Đời Component

### Các nguyên nhân làm Component Re-render:
1. **State Nội Bộ Thay Đổi**: Khi gọi `setState(...)`, React lên lịch re-render component chứa state đó.
2. **Props Thay Đổi**: Khi Component cha truyền props mới xuống con.
3. **Component Cha Re-render**: Mặc định khi cha re-render, tất cả các con của nó đều re-render (dù props không đổi - có thể tối ưu bằng `React.memo` ở B7).

---

## 🎯 Kết Quả Đạt Được & Tự Đánh Giá
- [x] Đã làm chủ JSX và tư duy phân tách Component nhỏ gọn.
- [x] Áp dụng đúng 3 dạng `useEffect` và cleanup timer/listeners.
- [x] Xây dựng Controlled Form quản lý nhiều field bằng 1 State Object.
- [x] Thực hiện thành công bài tập Lifting State Up giữa Form và List.
