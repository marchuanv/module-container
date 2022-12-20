const { test } = require('./test-runner.js');
const moduleName = 'github-branch';
const branchName = 'test';
const privateKey = process.env.GIT;

( async () => {
   await test({ moduleName, functionName: 'delete', testParams: { privateKey, branchName } }).assert(() => true);
   await test({ moduleName, functionName: 'isExisting', testParams: { privateKey, branchName } }).assert((res) => !res);
   await test({ moduleName, functionName: 'create', testParams: { privateKey, branchName } }).assert(() => true);
   await test({ moduleName, functionName: 'isExisting', testParams: { privateKey, branchName } }).assert((res) => res);
})();