// from "./container/registry.mjs";
// (async () => {
//   const vm = await require('vm');
//   const logging = await require('lib/logging.js');
//   const { createSession } = await require('lib/store.js');

//   module.exports = {
//     activate: async ({ sessionId, url, scriptFilePath }) => {
//       const { session } = await createSession({ sessionId });
//       const { readFileSync } = session;
//       const script = await readFileSync(scriptFilePath, { encoding: 'utf8' });
//       const segments = url.split('/').filter(x => x);
//       let funcName;
//       let context = {};
//       vm.createContext(context);
//       const functions = {
//         activate: () => {
//           try {
//             const vmScript = new vm.Script(script);
//             vmScript.runInContext(context);
//             logging.log({ info: `CONTEXT: ${context}` });
//             funcName = Object.keys(context)[0];
//             return true;
//           } catch (error) {
//             logging.log({ error });
//             logging.log({ info: error.stack });
//             return false;
//           }
//         },
//         call: async (input) => {
//           try {
//             const className = segments[0];
//             const funcName = segments[1];
//             const classFunc = context[className];
//             if (!classFunc) {
//               throw new Error(`the class: '${className}' does not exist in context. call activate first`);
//             }
//             const instance = new classFunc();
//             const func = instance[funcName];
//             if (!func) {
//               throw new Error(`function: '${funcName}' for class: '${className}' does not exist.`);
//             }
//             return await func(input);
//           } catch (error) {
//             logging.log({ error });
//             logging.log({ info: error.message });
//             return {
//               message: error.message,
//               stack: error.stack
//             };
//           }
//         }
//       };
//       return functions;
//     }
//   }
// })();