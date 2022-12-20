const { test } = require('./test-runner.js');
const moduleName = 'github-file';
const privateKey = process.env.GIT;
const branchName = 'test';
const fileName = 'test';

( async () => {
   const content = 'github-file-content-test';
   await test({ moduleName, functionName: 'deleteFile', testParams: { privateKey, branchName, fileName } }).assert((res) => !res);
   await test({ moduleName, functionName: 'ensureFileContent', testParams: { privateKey, branchName, fileName, content } }).assert(() => true);
   await test({ moduleName, functionName: 'getFileMetadata', testParams: { privateKey, branchName, fileName } }).assert((res) => res?.sha);
   await test({ moduleName, functionName: 'getFileContent', testParams: { privateKey, branchName, fileName } }).assert((res) => res === content);
})();