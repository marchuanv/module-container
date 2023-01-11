const { test } = require('./test-runner.js');
const privateKey = process.env.GIT;

( async () => {
   let moduleName = '';
   const branchName = 'test';
   const testName = 'github-test';

   moduleName = 'github-branch';
   await test({ testName, moduleName, functionName: 'delete', testParams: { privateKey, branchName } }).assert(() => true);
   await test({ testName, moduleName, functionName: 'isExisting', testParams: { privateKey, branchName } }).assert((res) => !res);
   await test({ testName, moduleName, functionName: 'create', testParams: { privateKey, branchName } }).assert(() => true);
   await test({ testName, moduleName, functionName: 'isExisting', testParams: { privateKey, branchName } }).assert((res) => res);

   moduleName = 'github-file';
   const fileName = 'test';
   const content = 'github-file-content-test';
   await test({ testName, moduleName, functionName: 'deleteFile', testParams: { privateKey, branchName, fileName } }).assert((res) => !res);
   await test({ testName, moduleName, functionName: 'ensureFileContent', testParams: { privateKey, branchName, fileName, content } }).assert(() => true);
   await test({ testName, moduleName, functionName: 'getFileMetadata', testParams: { privateKey, branchName, fileName } }).assert((res) => res?.sha);
   await test({ testName, moduleName, functionName: 'getFileContent', testParams: { privateKey, branchName, fileName } }).assert((res) => res === content);

})();