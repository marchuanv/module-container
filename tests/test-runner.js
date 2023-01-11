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
    const { testName, moduleName, functionName, testParams, callback, resolve } = test;

    logging.log({ info: ' ' });
    logging.log({ info: '---------------------------------------------------------------------' });
    logging.log({ info: `RUNNING ${testName.toUpperCase()}: ${moduleName} -> ${functionName}` });
    logging.log({ info: ' ' });

    const module = require(`../${moduleName}`)(testParams);
    const func = module[functionName];
    if (!func) {
      throw new Error(`the function ${functionName} does not exist for the ${moduleName} module.`);
    }
    const results = await func(testParams);
    const res = callback(results);
    logging.log({ info: ' ' });
    if(res) {
      logging.log({ info: 'TEST PASSED' });
    } else {
      logging.log({ info: 'TEST FAILED' });
    }
    resolve();
    lock = false;
    logging.log({ info: ' ' });
  }, 1000);
}
run();

module.exports = {
  test: ({ testName, moduleName, functionName, testParams }) => {
    const index = tests.length + 1;
    tests.push({ testName, index, moduleName, functionName, testParams, callback: null, resolve: null, isReady: false });
    return {
      assert: (callback) => {
        return new Promise((resolve) => {
          const itemIndex = tests.findIndex(x => 
            x.index === index &&
            x.moduleName === moduleName &&
            x.functionName === functionName
          );
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
