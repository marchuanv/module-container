const vm = require('vm');
module.exports = ({ url, objectScript }) => {
  const segments = url.split('/').map(x => x.toLowerCase()));
  const object = {};
  vm.createContext(object);
  const functions = {
    validate: () => { 
      vm.runInContext(script, context)
    },
    call: async (input) => {
      vm.runInContext(script, object);
      const output = {};
      for(const segName of segments) {
        const func = object[segName];
        output[segName] = await func(input);
      };
      return output;
    };
  };
  return functions;
}
