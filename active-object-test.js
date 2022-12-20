const { runTest } = require('./test-runner.js');
const moduleName = 'active-object';
const branchName = 'test';
const privateKey = process.env.GIT;
const url = '/doTest1/doTest2/doTest3';
const objectScript = `function test() {
  this.doTest1 = () => {console.log('test 01')};
  this.doTest2 = () => {console.log('test 02')};
  this.doTest3 = () => {console.log('test 03')};
}`;

( async () => {
   (await runTest({ moduleName, functionName: 'validate', testParams: { url, objectScript } })).assert(() => true);
   (await runTest({ moduleName, functionName: 'call', testParams: { url, objectScript } })).assert((res) => res);
})();
