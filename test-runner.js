module.exports = {
  runTest: async ({ moduleName, functionName, testParams }) => {
    const module = require(`./${moduleName}`)(testParams);
    await module[functionName](testParams);
  }
}
