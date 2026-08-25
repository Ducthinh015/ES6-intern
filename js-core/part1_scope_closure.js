
function counter() {
  let count = 0;
  return () => {
    count++;
    return count;
  };
}

const inc = counter();
const inc2 = counter();

console.log("Counter 1:");
console.log(inc());
console.log(inc());
console.log(inc());

console.log("Counter 2:");
console.log(inc2()); // 1
