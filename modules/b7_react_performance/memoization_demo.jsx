// B7: React Memoization & Performance Optimization Demo

import React, { useState, useMemo, useCallback } from 'react';

// Child component wrapped in React.memo
const ExpensiveChild = React.memo(({ title, onItemClick }) => {
  console.log(`⚡ [ExpensiveChild Render] Component "${title}" re-rendered at ${new Date().toLocaleTimeString()}`);

  return (
    <div className="p-3 border rounded bg-indigo-50 dark:bg-slate-800 my-2">
      <h6 className="font-bold text-sm text-indigo-700 dark:text-indigo-300">{title}</h6>
      <button 
        onClick={() => onItemClick(title)}
        className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
      >
        Trigger Action
      </button>
    </div>
  );
});

export function PerformanceDemo() {
  const [count, setCount] = useState(0);
  const [unrelatedState, setUnrelatedState] = useState(0);

  // Heavy computation memoized with useMemo
  const heavyCalculation = useMemo(() => {
    console.log('🐢 [useMemo] Calculating heavy factorial...');
    let result = 1;
    for (let i = 1; i <= 10000; i++) {
      result = (result + i) % 1000000;
    }
    return result + count;
  }, [count]);

  // Callback memoized with useCallback to maintain reference equality
  const handleChildClick = useCallback((childName) => {
    alert(`Child "${childName}" clicked! Parent count is ${count}`);
  }, [count]);

  return (
    <div className="p-4 border rounded-xl bg-white dark:bg-slate-900 space-y-4">
      <h5 className="font-bold text-base">React.memo + useMemo + useCallback Demo</h5>
      
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded font-medium"
        >
          Update Count ({count})
        </button>

        <button 
          onClick={() => setUnrelatedState(u => u + 1)}
          className="px-3 py-1.5 bg-slate-500 text-white text-sm rounded font-medium"
        >
          Unrelated Re-render ({unrelatedState})
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Heavy Calc Result: <strong>{heavyCalculation}</strong>
      </p>

      <ExpensiveChild title="Child Component A" onItemClick={handleChildClick} />
    </div>
  );
}
