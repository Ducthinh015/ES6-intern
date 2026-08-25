// app.js


import { add, PI } from './math.js';

import users from './users.js';

import appConfig, { log } from './utils.js';


log("Bắt đầu ứng dụng...");
console.log(`Cấu hình ứng dụng: Phiên bản ${appConfig.version}, Giao diện ${appConfig.theme}`);

console.log(`Số PI là: ${PI}`);
console.log(`10 + 5 = ${add(10, 5)}`);

console.log("Danh sách người dùng:");
users.forEach(user => {
  console.log(`- ${user.name} (ID: ${user.id})`);
});
