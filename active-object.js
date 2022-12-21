const vm = require('vm');
const logging = require('./logging');
const utils = require('utils');
module.exports = ({ url, script }) => {
  const segments = url.split('/').map(x => x.toLowerCase()).filter(x=>x);
  const context = {};
  vm.createContext(context);
  const functions = {
    isValidScript: () => {
      try {
        new vm.Script(script);
        return true;
      } catch(error) {
        logging.log({ error });
        logging.log({ info: error.message });
        logging.log({ info: error.stack });
        return false;
      } 
    },
    call: async (input) => {
      try {
        if (!functions.isValidScript()) {
          logging.log({ info: 'invalid script' });
          return;
        }
        vm.runInNewContext(script, context);
        logging.log(`CONTEXT: ${context}`);
        const mainFuncName = Object.keys(context)[0];
        const mainFunc = context[mainFuncName];
        const instance = new mainFunc(input);
        const instanceMemberNames = Object.keys(instance);
        const output = {};
        for(const segName of segments) {
          const funcName = instanceMemberNames.find(x => x.toLowerCase().replace(/^\s*$/,'') === segName.toLowerCase().replace(/^\s*$/,''));
          const func = instance[funcName];
          output[funcName] = await func(input);
        };
        return output;
      } catch (error) {
        logging.log({ error });
        logging.log({ info: error.message });
        logging.log({ info: error.stack });
        return {
          message: error.message,
          stack: error.stack
        };
      }
    }
  };
  return functions;
}
