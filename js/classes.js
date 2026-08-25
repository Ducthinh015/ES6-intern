export class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} kêu`;
  }
}

export class Dog extends Animal {
  speak() {
    return `${this.name} sủa`;
  }
}
