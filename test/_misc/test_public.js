#!/usr/bin/env node

class BaseClassWithPublicField {
  basePublicField = 'base class field';

  constructor() {
    //this.basePublicField = 'base class field';
  }
}

class SubClassWithPublicField extends BaseClassWithPublicField {
  //basePublicField = "sub class field";  // override base class
  subPublicField = 'sub class field';
  //mybasePublicField = this.basePublicField;
  
  constructor() {
    super();
    this.mybasePublicField = this.basePublicField;
  }

  log() {
    console.log(this.basePublicField);
    console.log(this.subPublicField);
    console.log(this.mybasePublicField);
  }
}

console.log(BaseClassWithPublicField.basePublicField)
console.log(SubClassWithPublicField.basePublicField)
console.log(SubClassWithPublicField.subPublicField)

let inst = new SubClassWithPublicField();
inst.log();
