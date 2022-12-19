require('./logging')('info');
module.exports = {
  runTest: async ({ moduleName, functionName, testParams }) => {
    const module = require(`./${moduleName}`)(testParams);
    const results = await module[functionName](testParams);
    return {
      assert: async (callback) => {
        const res = await callback(results);
        if(res) {
          console.log('TEST PASSED');
        } else {
          console.log('TEST FAILED');
        }
      }
    };
  }
}
