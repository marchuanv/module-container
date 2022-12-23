const { test } = require('./test-runner.js');
const moduleName = 'active-object';
const url = '/doTest1/doTest2/doTest3';
const script = `function test() {
  this.doTest1 = () => console.log('test 01'); this is wrong
  this.doTest2 = () => console.log('test 02');
  this.doTest3 = () => console.log('test 03');
}`;
const input = {};
( async () => {
  await test({ moduleName, functionName: 'isValidScript', testParams: { url, script, input } }).assert((res) => res === false);
  await test({ moduleName, functionName: 'activate', testParams: { url, script, input } }).assert(() => true);
  await test({ moduleName, functionName: 'call', testParams: { url, script, input } }).assert((res) => res.message && res.stack );
})();