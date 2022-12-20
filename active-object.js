const vm = require('vm');
const logging = require('./logging');
module.exports = ({ url, script }) => {
  const segments = url.split('/').map(x => x.toLowerCase()).filter(x=>x);
  const context = {};
  vm.createContext(context);
  const functions = {
    validate: () => {
      logging.log({ info: `SCRIPT: ${script}` });
      new vm.Script(script);
    },
    call: async (input) => {
      vm.runInNewContext(script, context);
      logging.log(`CONTEXT: ${context}`);
      const mainFuncName = Object.keys(context)[0];
      const mainFunc = context[mainFuncName];
      const instance = await mainFunc(input);
      const output = {};
      for(const segName of segments) {
        const func = instance[segName];
        output[segName] = await func(input);
      };
      return output;
    }
  };
  return functions;
}
