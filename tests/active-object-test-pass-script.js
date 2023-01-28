function TestClassA() {
  this.func1 = () => {
    return new TestClassB();
  }
}
function TestClassB() {
  this.func2 = () => {
    return new TestClassC();
  }
}
function TestClassC() {
  this.func3 = () => {
    return new TestClassD();
  }
}
function TestClassD() {
  this.func4 = () => {
    console.log('Hello World!');
  }
}