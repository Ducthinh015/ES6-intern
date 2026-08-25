

const users = [
  { id: 1, name: "An", age: 20, active: true },
  { id: 2, name: "Bình", age: 17, active: false },
  { id: 3, name: "Cường", age: 25, active: true },
];


const names = users.map(user => user.name);
console.log("Tên users:", names);


const adults = users.filter(user => user.age >= 18);
console.log("Users đủ 18 tuổi:", adults);

const activeUsers = users.filter(user => user.active);
console.log("Users active:", activeUsers);

const totalAge = users.reduce((sum, user) => sum + user.age, 0);
console.log("Tổng tuổi:", totalAge);


const userById = users.find(user => user.id === 2);
console.log("User có id = 2:", userById);


const hasUnderage = users.some(user => user.age < 18);
console.log("Có user dưới 18 không?:", hasUnderage);


const allHaveNames = users.every(user => user.name && user.name.trim() !== "");
console.log("Tất cả user có tên không?:", allHaveNames);
