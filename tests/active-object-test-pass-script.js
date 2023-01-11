function TestClassA() {
  this.doTest1 = () => {
    return new TestClassB();
  }
}
function TestClassB() {
  this.doTest2 = () => {
    return new TestClassC();
  }
}
function TestClassC() {
  this.doTest3 = () => {
    console.log('Hello World!');
  }
}