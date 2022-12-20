const vm = require('vm');
module.exports = ({ url, objectScript }) => {
  const segments = url.split('/').map(x => x.toLowerCase()).filter(x=>x);
  const object = {};
  vm.createContext(object);
  const functions = {
    validate: () => { 
      const script = new vm.Script(objectScript);
    },
    call: async (input) => {
      vm.runInContext(objectScript, object);
      const output = {};
      for(const segName of segments) {
        const func = object[segName];
        output[segName] = await func(input);
      };
      return output;
    }
  };
  return functions;
}
