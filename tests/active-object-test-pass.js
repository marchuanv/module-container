const { test } = require('./test-runner.js');
const moduleName = 'active-object';
const url = '/doTest1/doTest2/doTest3';
const script = `function test() {
  this.doTest1 = () => 'doTest1';
  this.doTest2 = () => 'doTest2';
  this.doTest3 = () => 'doTest3';
}`;
const input = {};
( async () => {
  await test({ moduleName, functionName: 'isValidScript', testParams: { url, script, input } }).assert((res) => res === true);
  await test({ moduleName, functionName: 'call', testParams: { url, script, input } }).assert(({ doTest1, doTest2, doTest3 }) => doTest1 && doTest2 && doTest3 );
})();
