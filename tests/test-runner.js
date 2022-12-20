const logging = require('../logging');
logging.setLevel({ level: 'info' });
const tests = [];
let lock = false;
let count = 0;
async function run() {
  const intervalId = setInterval(async() => {
    
    if (tests.length === 0 || lock) {
      clearInterval(intervalId);
      count = (count + 1);
      if (count > 5) {
        return clearInterval(intervalId);
      } else {
        return await run();
      }
    }
    
    const test = tests.shift();
    if (!test.isReady) {
      tests.push(test);
      return await run();
    }

    count = 0;
    lock = true;
    const { moduleName, functionName, testParams, callback, resolve } = test;
    const module = require(`../${moduleName}`)(testParams);
    const func = module[functionName];
    const results = await func(testParams);
    const res = callback(results);
    if(res) {
      logging.log({ info: '---------------------------------------------------------------------' });
      logging.log({ info: `TEST PASSED: ${moduleName}/${functionName}` });
      logging.log({ info: '---------------------------------------------------------------------' });
    } else {
      logging.log({ info: '---------------------------------------------------------------------' });
      logging.log({ info: `TEST FAILED: ${moduleName}/${functionName}` });
      logging.log({ info: '---------------------------------------------------------------------' });
    }
    resolve();
    lock = false;
  }, 1000);
}
run();

module.exports = {
  test: ({ moduleName, functionName, testParams }) => {
    tests.push({ moduleName, functionName, testParams, callback: null, resolve: null, isReady: false });
    return {
      assert: (callback) => {
        return new Promise((resolve) => {
          const itemIndex = tests.findIndex(x => x.moduleName === moduleName && x.functionName === functionName);
          const item = tests.splice(itemIndex, 1)[0];
          item.callback = callback;
          item.resolve = resolve;
          item.isReady = true;
          tests.push(item);
        });
      }
    }
  }
}
