const { test } = require('./test-runner.js');
const moduleName = 'active-object';
const url = '/doTest1/doTest2/doTest3';
const script = `
function TestClassA() {
  this.doTest1 = () => new TestClassB();
}
function TestClassB() {
  this.doTest2 = () => new TestClassC();
}
function TestClassC() {
  this.doTest3 = () => console.log('Hello World!');
}
`;
const input = {};
( async () => {
  await test({ moduleName, functionName: 'activate', testParams: { url, script, input } }).assert((res) => res === true ? true: false);
  await test({ moduleName, functionName: 'call', testParams: { url, script, input } }).assert(({ doTest1, doTest2, doTest3 }) => doTest1 && doTest2 && doTest3 );
})();
