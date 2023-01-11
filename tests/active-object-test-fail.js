const { test } = require('./test-runner.js');
const path = require('path');
const moduleName = 'active-object';
const url = '/doTest1/doTest2/doTest3';
const scriptFilePath = path.join(__dirname,'active-object-test-fail-script.js');
const input = {};
( async () => {
  const testName = 'active-object-test-fail';
  await test({ testName, moduleName, functionName: 'activate', testParams: { url, scriptFilePath, input } }).assert((res) => res === false ? true: false );
  await test({ testName, moduleName, functionName: 'call', testParams: { url, scriptFilePath, input } }).assert((res) => res.message && res.stack );
})();
