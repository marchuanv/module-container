function test() {
  this.doTest1 = () => console.log('test 01'); this is wrong
  this.doTest2 = () => console.log('test 02');
  this.doTest3 = () => console.log('test 03');
}