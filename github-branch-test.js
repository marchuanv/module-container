require('./logging')('info');
const { runTest } = require('./test-runner.js');
const moduleName = 'github-branch';
const branchName = 'test';
const privateKey = privateKey: process.env.GIT;

runTest({ 
  moduleName,
  branchName,
  privateKey,
  'delete'
}).assert(() => {
  return true;
});

( async () => {
   const isExisting = await testBranch.isExisting()
   if (isExisting) {
      console.log('TEST FAILED');
      throw new Error('test failed.');
   }
   console.log('TEST PASSED');
})();

( async () => {
   await testBranch.create();
   const isExisting = await testBranch.isExisting();
   if (!isExisting) {
      console.log('TEST FAILED');
      throw new Error('test failed.');
   }
   console.log('TEST PASSED');
})();
