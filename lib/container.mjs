const promises = [];
const objects = [];

const nemeberMatch = /([\"\'\s]+)?[a-zA-Z0-9]+(\s+)?\(/g;
const asyncMemeberMatch = /([\"\'\s]+)?async([\s]+)?[a-zA-Z0-9]+([\s]+)?\(/g;
const isContainerType = /class([\s]+)?[a-zA-Z0-9]+([\s]+)?extends([\s]+)?Container/g
const hasConstructorArgs = /constructor([\s]+)?\([\{\}\s\,\=\:a-zA-Z0-9]+\)/g

export class Container {
   constructor() {
      if (this.constructor.name === 'Container') {
         throw new Error('Container is an abstract class');
      }
      for (const prop of Object.getOwnPropertyNames(this.constructor.prototype)) {
         if (prop !== 'constructor') {
            createMemeber(this, prop, async () => {
               while (promises.length > 0) {
                  const promise = promises.shift();
                  await promise();
               }
            });
         }
      }
   }
   dependency(obj) {

      let ctorArgs = {};
      const keys = Object.keys(obj);
      const ctorArgsKey = keys.find(x => x === 'ctorArgs'); //cant have the same member on an object more than once
      const thisClassName = this.constructor.name;
      const containerClasses = [];
      const containerClassesWithArgs = [];
      for (const key of keys.filter(key => (typeof obj[key] === 'function'))) {
         isContainerType.lastIndex = -1;
         hasConstructorArgs.lastIndex = -1;
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

      for (const key of keys) {
         let name = key;
         let value = obj[key];
         if (!value) {
            throw new Error(`the "${name}" property is null or undefined. Supply the field as a dependency of the ${thisClassName} class.`);
         }
         const isFunction = typeof value === 'function';
         let isDependencyFunction = false;
         const containerClass = containerClasses.find(x => x === key);
         if (isFunction && !containerClass && value.toString().startsWith('class')) {
            throw new Error('new up classes that do not extend Container and pass the reference');
         }

         if (containerClass) {
            name = getTypeName({ Class: value });
         }
         if (isDependencyFunction) {
            promises.unshift(obj);
         } else {
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

const createMemeber = function (context, name, callback) {
   nemeberMatch.lastIndex = -1;
   asyncMemeberMatch.lastIndex = -1;
   const member = context.constructor.prototype[name];
   let isMemberMatch = false;
   let isAsyncMemberMatch = false;
   const info = member ? member.toString() : "";
   let memberMatch = [];
   let match = nemeberMatch.exec(info);
   while (match) {
      memberMatch = memberMatch.concat(match);
      match = nemeberMatch.exec(info);
   }
   memberMatch = memberMatch.filter(x => x);
   if (memberMatch.length > 0) {
      memberMatch = memberMatch[0].replace(/\s+/g, '');
      if (memberMatch.indexOf(`${name}(`) > -1) {
         isMemberMatch = true;
      }
   }
   memberMatch = [];
   match = asyncMemeberMatch.exec(info);
   while (match) {
      memberMatch = memberMatch.concat(match);
      match = asyncMemeberMatch.exec(info);
   }
   if (memberMatch.length > 0) {
      memberMatch = memberMatch[0].replace(/\s+/g, '');
      if (memberMatch.indexOf(`${name}(`) > -1) {
         isAsyncMemberMatch = true;
      }
   }
   if (isMemberMatch && isAsyncMemberMatch) {
      Object.defineProperty(context, name, {
         configurable: false, value: async function (args) {
            await callback(args);
            return await member.call(context, args);
         }
      });
   } else if (!isMemberMatch) {
      Object.defineProperty(context, name, {
         configurable: true, get: (args) => {
            const stack = (new Error()).stack.split("\n");
            const caller = stack[2].trim().split(" ")[1];
            const callerSeg = caller.split('.');
            const callingFuncName = callerSeg[callerSeg.length - 1];
            const actualClassName = context.constructor.name;
            const prototype = Object.getPrototypeOf(context);
            if (caller === 'new') {
               return callback(args);
            }
            if (prototype[callingFuncName] && prototype[callingFuncName].name === callingFuncName && caller === `${actualClassName}.${callingFuncName}`) {
               return callback(args);
            }
            throw new Error(`Unable to access property: ${name}, it is private to: ${prototype.constructor.name}`);
         }
      });
   }
}