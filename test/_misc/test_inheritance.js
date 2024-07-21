
class Class1 {

  constructor() {
    this.value = "abc";
  }

  getMyValue() {
    return this.value;
  }

  getValue() {
    return this.getMyValue()
  }
}

class Class2 extends Class1 {

  constructor() {
    super();
    this.value2 = "xyz";
  }

  getMyValue() {
    return this.value2;
  }

}

let f1 = new Class1();
console.log(f1.getMyValue() + " " + f1.getValue());
let f2 = new Class2();
console.log(f2.getMyValue() + " " + f2.getValue());
