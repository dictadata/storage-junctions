#!/usr/bin/env node

class BaseClassWithStaticField {
  static baseStaticField = 'base class field';

  log() {
    console.log(BaseClassWithStaticField.baseStaticField);
  }
}

class SubClassWithStaticField extends BaseClassWithStaticField {
  static baseStaticField = "sub class field";  // override base class
  static subStaticField = 'sub class field';
  static mybaseStaticField = super.baseStaticField;

  constructor() {
    super();
  }

  log() {
    super.log();
    console.log(SubClassWithStaticField.baseStaticField);
    console.log(SubClassWithStaticField.subStaticField);
    console.log(SubClassWithStaticField.mybaseStaticField);
  }
}

console.log(BaseClassWithStaticField.baseStaticField)
console.log(SubClassWithStaticField.baseStaticField)
console.log(SubClassWithStaticField.subStaticField)
console.log(SubClassWithStaticField.mybaseStaticField)

console.log();
let inst = new SubClassWithStaticField();
inst.log();
