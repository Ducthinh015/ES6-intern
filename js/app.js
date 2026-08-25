import { createCounter } from './closure.js';
import { users, getUsersView, totalAge } from './array-methods.js';
import { runSequentialDemo, runParallelDemo } from './async.js';
import { playEventLoopDemo } from './event-loop.js';

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
  'Bài tổng hợp + Q&A mentor'
];

let completed = tasks.map(() => false);

function renderTasks() {
  const list = document.querySelector('#task-list');
  list.innerHTML = '';

  tasks.forEach((task, index) => {
    const row = document.createElement('label');
    row.className = 'task';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = completed[index];
    checkbox.addEventListener('change', () => {
      completed[index] = checkbox.checked;
      updateProgress();
    });

    const text = document.createElement('div');
    const group = index < 4 ? 'Nền tảng ngôn ngữ' : index < 9 ? 'Bất đồng bộ & nâng cao' : 'Final assessment';
    text.innerHTML = `<strong>${String(index + 1).padStart(2, '0')}. ${task}</strong><small>${group}</small>`;

    row.append(checkbox, text);
    list.append(row);
  });
}

function updateProgress() {
  const done = completed.filter(Boolean).length;
  const percent = Math.round(done / completed.length * 100);
  document.querySelector('#progress-label').textContent = `${percent}%`;
  document.querySelector('#progress-bar').style.width = `${percent}%`;
  document.querySelector('#progress-copy').textContent =
    done === 10 ? 'Hoàn thành toàn bộ DEV-FE-003.' :
    done >= 7 ? 'Gần xong — tập trung final test & Q&A.' :
    done >= 3 ? 'Đang tiến triển tốt — tiếp tục phần async.' :
    'Bắt đầu từ phần nền tảng JavaScript.';
}

document.querySelector('#reset-btn').addEventListener('click', () => {
  completed = completed.map(() => false);
  renderTasks();
  updateProgress();
});

const inc = createCounter();
document.querySelector('#counter-btn').addEventListener('click', () => {
  document.querySelector('#counter-value').textContent = inc();
});

function renderUsers(mode = 'all') {
  const view = document.querySelector('#users-view');
  const data = getUsersView(mode);

  view.innerHTML = data.map(item => {
    if (typeof item === 'string') return `<div class="user"><strong>${item}</strong></div>`;
    return `<div class="user"><strong>${item.name}</strong><span>${item.age} tuổi · ${item.active ? 'active' : 'inactive'}</span></div>`;
  }).join('');
}

document.querySelector('#array-actions').addEventListener('click', event => {
  const button = event.target.closest('button[data-mode]');
  if (button) renderUsers(button.dataset.mode);
});

document.querySelector('#age-total').textContent = totalAge(users);

document.querySelector('#event-btn').addEventListener('click', async () => {
  const btn = document.querySelector('#event-btn');
  btn.disabled = true;
  await playEventLoopDemo(value => {
    document.querySelector('#event-output').textContent = value;
  });
  btn.disabled = false;
});

document.querySelector('#seq-btn').addEventListener('click', async () => {
  const ms = await runSequentialDemo();
  document.querySelector('#seq-time').textContent = `${(ms / 1000).toFixed(1)}s`;
  document.querySelector('#async-note').textContent = 'Tuần tự: tác vụ B chờ A hoàn thành rồi mới chạy.';
});

document.querySelector('#par-btn').addEventListener('click', async () => {
  const ms = await runParallelDemo();
  document.querySelector('#par-time').textContent = `${(ms / 1000).toFixed(1)}s`;
  document.querySelector('#async-note').textContent = 'Promise.all: hai tác vụ độc lập chạy đồng thời.';
});

renderTasks();
updateProgress();
renderUsers();
