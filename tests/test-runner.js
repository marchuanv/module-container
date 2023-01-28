const logging = require('../logging');
logging.setLevel({ level: 'info' });
const tests = [];
const modules = [];
let lock = false;
let intervalId = null;
let hasTests = false;

async function run() {
  
  if (lock) {
    return;
  }

  let test = tests.sort((x,y) => x.priority - y.priority)[0]; //peek
  if (!test.isReady) {
    return;
  }

  test = tests.shift();

  lock = true;
  const { testName, moduleName, functionName, testParams, callback, resolve,  } = test;
  const { module } = modules.find(x => x.moduleName === moduleName && x.testName === testName) || { };

  logging.log({ info: ' ' });
  logging.log({ info: '---------------------------------------------------------------------' });
  logging.log({ info: `RUNNING ${testName.toUpperCase()}: ${moduleName} -> ${functionName}` });
  logging.log({ info: ' ' });
  
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
    process.exit(1);
  }
  resolve();
  lock = false;
  logging.log({ info: ' ' });
}
intervalId = setInterval(async() => {
  if (tests.length > 0) {
    await run();
  } else if (hasTests) {
    clearInterval(intervalId);
  }
}, 1000);

module.exports = {
  test: ({ testName, moduleName, functionName, testParams }) => {
    const priority = tests.length + 1;
    //matching tests with same module
    let { module } = modules.find(x =>
      x.testName === testName && 
      x.moduleName === moduleName &&
      x.module
    ) || { };
    if (!module) {
      module = require(`../${moduleName}`)(testParams);
      modules.push({ testName, moduleName, module });
    }
    tests.push({ 
      priority,
      testName,
      moduleName,
      functionName,
      testParams,
      callback: null,
      resolve: null,
      isReady: false,
    });
    hasTests = true;
    return {
      assert: (callback) => {
        return new Promise((resolve) => {
          const test = tests.find(x =>
            !x.callback &&
            !x.resolve &&
            !x.isReady &&
            x.testName === testName &&
            x.moduleName === moduleName &&
            x.functionName === functionName
          );
          test.callback = callback;
          test.resolve = resolve;
          test.isReady = true;
        });
      }
    }
  }
}
