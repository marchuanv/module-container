require('./logging')('info');
module.exports = {
  runTest: async ({ moduleName, functionName, testParams }) => {
    const module = require(`./${moduleName}`)(testParams);
    await module[functionName](testParams);
    return {
      assert: async (callback) => {
        const results = await callback();
        if(results) {
          console.log('TEST PASSED');
        } else {
          console.log('TEST FAILED');
        }
      }
    };
  }
}
