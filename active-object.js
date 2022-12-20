module.exports = ({ url, objectScript }) => {
  const segments = url.split('/').map(x => x.toLowerCase()));
  const object = {};
  const functions = {
    call: async (input) => {
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
