const { test } = require('./test-runner.js');
const path = require('path');
const moduleName = 'active-object';
const url = '/TestClassA/func1';
const scriptFilePath = path.join(__dirname,'active-object-test-pass-script.js');
const input = {};
( async () => {
  const testName = 'active-object-test-pass';
  await test({ testName, moduleName, functionName: 'activate', testParams: { url, scriptFilePath, input } }).assert((res) => res === true ? true: false);
  await test({ testName, moduleName, functionName: 'call', testParams: { url, scriptFilePath, input } }).assert(({ func2 }) => func2 );
})();
