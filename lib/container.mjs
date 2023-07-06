const promises = [];
const objects = [];

export class Container {
   constructor() {
      if (this.constructor.name === 'Container') {
         throw new Error('Container is an abstract class');
      }
      const properties = Object.getOwnPropertyNames(this.constructor.prototype).filter(prop => prop !== 'constructor' && prop !== '<anonymous>');
      for (const prop of properties) {
         createMemeber(this, prop, async () => {
            if (promises.length > 0) {
               promises.shift();
               const anonymousFunc = this['<anonymous>'];
               if (!anonymousFunc || typeof anonymousFunc !== 'function') {
                  throw new Error('promise function member was not created.')
               }
               await anonymousFunc.call(this);
            }
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
         createMemeber(this, '<anonymous>', async () => {
            await obj.call(this);
         });
         promises.push(true);
      } else {
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
            createMemeber(this, name, () => {
               if (containerClass) {
                  return new value(ctorArgs);
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

const createMemeber = function (context, name, callback, stackId) {
   const methodMatch = /^\"?\'?async\s+[a-zA-Z0-9]+([\s]+)?\(/g;
   const asyncMethodMatch = /async\s+[a-zA-Z0-9]+([\s]+)?\(/g;
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
         return Object.defineProperty(context, name, {
            configurable: false, value: function (args) {
               callback.call(context, args);
               return existingMember.call(context, args);
            }
         });
      }
      throw new Error(`failed to re-define ${name} member`);
   } else {
      context.constructor.prototype[name] = () => {
         console.log('should have been overidden');
      };
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
            const actualFunctionName = actualFunction ? actualFunction.name : '';
            if (callingFuncName === '<anonymous>' && actualFunction && !actualFunctionName) {
               actualFunctionName = '<anonymous>';
            }
            if (prototype[callingFuncName] && actualFunctionName === callingFuncName && caller === `${actualClassName}.${callingFuncName}`) {
               return callback.call(context, args);
            }
            throw new Error(`Unable to access property: ${name}, it is private to: ${prototype.constructor.name}`);
         }
      });
   }
}