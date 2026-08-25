

const obj = {
  name: "An",

  hi() {
    return this.name;
  },

  hiArrow: () => this.name,
};

console.log("Hi function thường (gọi từ obj):", obj.hi());


console.log("Hi arrow function:", obj.hiArrow()); 
