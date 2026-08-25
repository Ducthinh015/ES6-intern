

class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} kêu`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  speak() {
    return `${this.name} sủa: Gâu gâu!`;
  }
}
const cat = new Animal("Mèo Mướp");
const myDog = new Dog("Cậu Vàng", "Shiba");

console.log(cat.speak());
console.log(myDog.speak());
