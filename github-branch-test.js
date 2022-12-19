const testBranch = require('./github-branch')({ branchName: 'test', privateKey: process.env.GIT });
require('./logging')('info');
( async () => {
   await testBranch.delete();
   const isExisting = await testBranch.isExisting()
   if (isExisting) {
      console.log('TEST FAILED');
      throw new Error('test failed.');
   }
   console.log('TEST PASSED');
})();

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