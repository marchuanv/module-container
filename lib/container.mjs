import utils from "utils";

const promises = [];
const promiseStack = [];

export class Container {
   constructor() {
      if (this.constructor.name === 'Container') {
         throw new Error('Container is an abstract class');
      }
      const properties = Object.getOwnPropertyNames(this.constructor.prototype).filter(prop => prop !== 'constructor' && prop !== '<anonymous>');
      for (const prop of properties) {
         createMember(this, prop, async () => {
            if (promises.length > 0) {
               let id = promises.shift();
               promiseStack.push({ context: this.constructor.name, id });
               await this[id];
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
         const id = utils.generateGUID();
         createMember(this, id, async () => {
            await obj.call(this);
         });
         promises.push(id);
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
            createMember(this, name, () => {
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

const createMember = function (context, name, callback) {
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
         return Object.defineProperty(context, name, {
            configurable: false, value: function (args) {
               callback.call(context, args);
               return existingMember.call(context, args);
            }
         });
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
            const pStack = promiseStack.shift();
            if (pStack && actualClassName === pStack.context) {
               promiseStack.unshift(pStack);
               return callback.call(context, args);
            }
            throw new Error(`Unable to access property: ${name}, it is private to: ${prototype.constructor.name}`);
         }
      });
   }
}