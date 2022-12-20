const { runTest } = require('./test-runner.js');
const moduleName = 'github-branch';
const branchName = 'test';
const privateKey = process.env.GIT;

( async () => {
   (await runTest({ moduleName, functionName: 'delete', testParams: { privateKey, branchName } })).assert(() => true);
   (await runTest({ moduleName, functionName: 'isExisting', testParams: { privateKey, branchName } })).assert((res) => !res);
   (await runTest({ moduleName, functionName: 'create', testParams: { privateKey, branchName } })).assert(() => true);
   (await runTest({ moduleName, functionName: 'isExisting', testParams: { privateKey, branchName } })).assert((res) => res);
})();