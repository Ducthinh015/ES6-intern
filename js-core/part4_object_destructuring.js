
const user = { id: 1, name: "An", age: 20, active: true, address: { city: "Hà Nội" } };
const user2 = { role: "admin", active: false };
const arr = [10, 20, 30, 40, 50];

const { name, age } = user;
console.log("Destructuring:", name, age);

const clonedUser = { ...user };
console.log("Cloned user:", clonedUser);
console.log("Is same reference?", clonedUser === user);

const mergedUser = {
  ...user,
  ...user2,
};
console.log("Merged user (ghi đè active):", mergedUser);

const [first, ...rest] = arr;
console.log("First element:", first);
console.log("Rest of elements:", rest);

const city = user?.address?.city;
const zip = user?.address?.zipCode;
console.log("City (optional chaining):", city);
console.log("ZipCode (optional chaining):", zip);

let input = null;
const value1 = input ?? "default value";
console.log("Nullish Coalescing (null):", value1);

input = "";
const value2 = input ?? "default value";
console.log("Nullish Coalescing (rỗng):", `"${value2}"`); 