const logging = require('../logging');
logging.setLevel({ level: 'info' });
module.exports = {
  runTest: async ({ moduleName, functionName, testParams }) => {
    const module = require(`../${moduleName}`)(testParams);
    const func = module[functionName];
    const results = await func(testParams);
    return {
      assert: async (callback) => {
        const res = await callback(results);
        if(res) {
          console.log('---------------------------------------------------------------------');
          console.log(`TEST PASSED: ${moduleName}/${functionName}`);
          console.log('---------------------------------------------------------------------');
        } else {
          console.log('---------------------------------------------------------------------');
          console.log(`TEST FAILED: ${moduleName}/${functionName}`);
          console.log('---------------------------------------------------------------------');
        }
      }
    };
  }
}
