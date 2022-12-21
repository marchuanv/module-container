const vm = require('vm');
const logging = require('./logging');
const utils = require('utils');
module.exports = ({ url, script }) => {
  const segments = url.split('/').map(x => x.toLowerCase()).filter(x=>x);
  let context = {};
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
    activate: () => {
      vm.runInNewContext(script, context);
      logging.log(`CONTEXT: ${context}`);
    },
    call: async (input) => {
      try {
        const funcName = Object.keys(context)[0];
        const func = context[funcName];
        const instance = new func(input);
        const instanceMemberNames = Object.keys(instance);
        for(const segName of segments) {
          const funcName = instanceMemberNames.find(x => x.toLowerCase().replace(/^\s*$/,'') === segName.toLowerCase().replace(/^\s*$/,''));
          if (funcName) {
            const func = instance[funcName];
            const output = await func(input);
            if (output.prototype) {
              context = output;
              await functions.call({ input });
            } else {
              return output;
            }
          }
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
