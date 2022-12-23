const { test } = require('./test-runner.js');
const privateKey = process.env.GIT;

( async () => {
   let moduleName = '';
   const branchName = 'test';

   moduleName = 'github-branch';
   await test({ moduleName, functionName: 'delete', testParams: { privateKey, branchName } }).assert(() => true);
   await test({ moduleName, functionName: 'isExisting', testParams: { privateKey, branchName } }).assert((res) => !res);
   await test({ moduleName, functionName: 'create', testParams: { privateKey, branchName } }).assert(() => true);
   await test({ moduleName, functionName: 'isExisting', testParams: { privateKey, branchName } }).assert((res) => res);

   moduleName = 'github-file';
   const fileName = 'test';
   const content = 'github-file-content-test';
   await test({ moduleName, functionName: 'deleteFile', testParams: { privateKey, branchName, fileName } }).assert((res) => !res);
   await test({ moduleName, functionName: 'ensureFileContent', testParams: { privateKey, branchName, fileName, content } }).assert(() => true);
   await test({ moduleName, functionName: 'getFileMetadata', testParams: { privateKey, branchName, fileName } }).assert((res) => res?.sha);
   await test({ moduleName, functionName: 'getFileContent', testParams: { privateKey, branchName, fileName } }).assert((res) => res === content);

})();