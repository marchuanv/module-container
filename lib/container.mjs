import utils from "utils";

const dependencyKeyValues = [];
let promises = [];
const processing = [];
let lock = false;
const resolvePromises = async() => {
   if (lock) {
      setTimeout(() => {
         resolvePromises();
      }, 1000);
   }
   lock = true;
   promises = promises.sort((x,y) => x.priority - y.priority);
   if (promises.length > 0) {
      let { context, promise, priority } = promises.shift();
      if (priority === 1) {
         processing.push({ context });
         await promise();
      } else {
         await promise();
      }
   }
   lock = false;
}

export class Container {
   constructor() {
      if (this.constructor.name === 'Container') {
         throw new Error('Container is an abstract class');
      }
      const properties = Object.getOwnPropertyNames(this.constructor.prototype).filter(prop => prop !== 'constructor' && prop !== '<anonymous>');
      for (const prop of properties) {
         createMember(this, prop, () => {
            return new Promise((resolve) => {
               promises.unshift({ context: this.constructor.name, promise: resolve, priority: 2 });
               resolvePromises();
            });
         });
      }
   }
   dependency(obj) {

      let ctorArgs = {};
      const keys = Object.keys(obj);
      const ctorArgsKey = keys.find(x => x === 'ctorArgs'); //cant have the same existingMember on an object more than once
      const thisClassName = this.constructor.name;
      const containerClasses = [];
      const containerClassesWithArgs = [];

      for (const key of keys.filter(key => (typeof obj[key] === 'function'))) {
         const isContainerType = /class([\s]+)?[a-zA-Z0-9]+([\s]+)?extends([\s]+)?Container/g
         const hasConstructorArgs = /constructor([\s]+)?\([\{\}\s\,\=\:a-zA-Z0-9]+\)/g
         const value = obj[key].toString() || "";
         if (isContainerType.test(value)) {
            containerClasses.push(key);
            if (hasConstructorArgs.test(value)) {
               containerClassesWithArgs.push(key);
            }
         }
      }

      if (ctorArgsKey && containerClassesWithArgs.length >= 1) {
         ctorArgs = obj[ctorArgsKey];
      } else if (!ctorArgsKey && containerClassesWithArgs.length >= 1) {
         throw new Error('no constructor arguments provided');
      }
      if (keys.length === 0 && typeof obj === 'function') {
         promises.unshift({ context: this.constructor.name, promise: obj, priority: 1 });
         resolvePromises();
      } else {
         for(const key of Object.keys(ctorArgs)) {
            if (typeof ctorArgs[key] === 'object' || typeof ctorArgs[key] === 'function') {
               throw new Error(`${thisClassName} ctorArgs have object or function references`);
            }
         }
         for (const key of keys) {
            let name = key;
            let value = obj[key];
            if (!value) {
               throw new Error(`the "${name}" property is null or undefined. Supply the field as a dependency of the ${thisClassName} class.`);
            }
            const isFunction = typeof value === 'function';
            const containerClass = containerClasses.find(x => x === key);
            if (isFunction && !containerClass && value.toString().startsWith('class')) {
               throw new Error('new up classes that do not extend Container and pass the reference');
            }
            if (containerClass) {
               name = getTypeName({ Class: value });
            }
            const dependency = dependencyKeyValues.find(o => o.key === key);
            if (dependency) {
               if (dependency.type) {
                  if (dependency.type.name !== containerClass) {
                     throw new Error('critical error');
                  }
                  const allCtorKeys = Object.keys(ctorArgs).concat(dependency.value);
                  for(const key of allCtorKeys) {
                     if (ctorArgs[key] !== dependency.ctorArgs[key]) {
                        dependency.changed = true;
                        break;
                     }
                  }
               } else {
                  if (utils.sizeOf(value) !== utils.sizeOf(dependency.value)) {
                     dependency.changed = true;
                  }
               }
            } else {
               if (containerClass) {
                  dependencyKeyValues.push({ key, value: ctorArgs, type: value, changed: true });
               } else {
                  dependencyKeyValues.push({ key, value, type: null, changed: true });
               }
            }
         }
         for(const { key, value, type } of dependencyKeyValues.filter(d => d.changed)) {
            const config = dependencyKeyValues.find(x => x.key === key);
            config.changed = false;
            createMember(this, key, () => {
               if (typeof type === 'function') {
                  return new type(value);
               }
               return value;
            });
         }
      }
   }
}

const getTypeName = function ({ Class }) {
   let name = Class.name;
   name = name.charAt(0).toLowerCase() + name.slice(1);
   return name;
}

const createMember = function (context, name, callback, done) {
   const methodMatch = /^\"?\'?([\s]+)?[a-zA-Z0-9]+([\s]+)?\(/g;
   const asyncMethodMatch = /^\"?\'?([\s]+)?async\s+[a-zA-Z0-9]+([\s]+)?\(/g;
   const anonymousMethodMatch = /^\"?\'?([\s]+)?\(([\{\}\s\$\,\=\:a-zA-Z0-9]+)?\)([\s]+)?=>/g;
   const existingMember = context.constructor.prototype[name];
   if (existingMember) {
      const info = existingMember.toString();
      if (asyncMethodMatch.test(info)) {
         return Object.defineProperty(context, name, {
            configurable: false, value: async function (args) {
               await callback.call(context, args);
               return await existingMember.call(context, args);
            }
         });
      } else if (methodMatch.test(info)) {
         throw new Error(`member ${name} of ${context.constructor.name} extended container must be async`);  
      } else if (anonymousMethodMatch.test(info)) {
         throw new Error(`anonymous members can't be re-define`);  
      }
      throw new Error(`failed to re-define ${name} member`);
   } else {
      Object.defineProperty(context, name, {
         configurable: true, get: (args) => {
            const stack = (new Error()).stack.split("\n");
            const caller = stack[2].trim().split(" ")[1];
            if (caller === 'new') {
               return callback.call(context, args);
            }
            const callerSeg = caller.split('.');
            const callingFuncName = callerSeg[callerSeg.length - 1];
            const actualClassName = context.constructor.name;
            const prototype = Object.getPrototypeOf(context);
            let actualFunction = prototype[callingFuncName];
            let actualFunctionName = actualFunction ? actualFunction.name : '';
            if (prototype[callingFuncName] && actualFunctionName === callingFuncName && caller === `${actualClassName}.${callingFuncName}`) {
               return callback.call(context, args);
            }
            const process = processing.shift();
            if (process && actualClassName === process.context) {
               processing.unshift(process);
               return callback.call(context, args);
            }
            throw new Error(`Unable to access property: ${name}, it is private to: ${prototype.constructor.name}`);
         }
      });
   }
   if (done) {
      done();
   }
}