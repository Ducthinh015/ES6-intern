// B4: React Fundamentals - Components & Hooks Demo

import React, { useState, useEffect } from 'react';

/**
 * 1. UserCard Component - Demonstrating Props & JSX
 */
export function UserCard({ name, email, role = 'Member' }) {
  return (
    <div className="user-card p-4 border rounded-xl bg-white dark:bg-slate-800 shadow-sm mb-3">
      <h4 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{name}</h4>
      <p className="text-sm text-slate-500">{email}</p>
      <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 rounded font-medium">
        {role}
      </span>
    </div>
  );
}

/**
 * 2. CounterWithEffect - Demonstrating useState & useEffect Lifecycle
 */
export function CounterWithEffect() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState([]);

  useEffect(() => {
    setLog(prev => [...prev, `Count changed to: ${count} at ${new Date().toLocaleTimeString()}`]);
  }, [count]);

  return (
    <div className="counter-box p-4 border rounded-xl bg-slate-50 dark:bg-slate-900">
      <h5 className="font-semibold mb-2">useState & useEffect Lifecycle Demo</h5>
      <p className="text-2xl font-extrabold text-purple-600 mb-3">{count}</p>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(0)}
          className="px-3 py-1 bg-slate-300 dark:bg-slate-700 text-sm rounded"
        >
          Reset
        </button>
      </div>

      <div className="text-xs text-slate-500 max-h-24 overflow-y-auto space-y-1">
        {log.map((entry, idx) => (
          <div key={idx}>• {entry}</div>
        ))}
      </div>
    </div>
  );
}
