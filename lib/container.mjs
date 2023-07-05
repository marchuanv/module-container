
import utils from 'utils'
import path from 'node:path'
import vm from 'node:vm'
import http from 'node:http'

const register = new Map();
const objects = new Map();
const bag = new Map();

class ContainerRegistry {
   isRegistered({ ref, type }) {
      const registeredType = register.get(ref);
      if (registeredType === type) {
         return true;
      }
      return false;
   }
   isSingletonRegistered({ type }) {
      const ref = getTypeRef({ type });
      return this.isRegistered({ ref, type });
   }
   isRefRegistered({ ref }) {
      const type = register.get(ref);
      return this.isRegistered({ ref, type });
   }
   getRegisteredType({ ref }) {
      return register.get(ref);
   }
   getRegisteredTypeArgs({ ref }) {
      const type = this.getRegisteredType({ ref });
      return register.get(type);
   }
   getRegisteredTypes() {
      const registeredKeys = [];
      for (const key of register.keys()) {
         if (typeof key === 'string') {
            registeredKeys.push(key);
         }
      }
      return registeredKeys.map(ref => { return { ref, Class: register.get(ref) } });
   }
}
const registry = new ContainerRegistry();
export class Container {
   constructor() {
      const thisRef = getTypeRef({ Class: this.constructor });
      if (this.constructor === Container.name) {
         throw new Error(`${Container.name} is an abstract class`);
      }
      bag.delete(thisRef);
      bag.set(thisRef, {});
      createPrivateProperty({
         name: 'bag', instance: this, callback: () => {
            return bag.get(thisRef);
         }
      });
      createPrivateProperty({
         name: 'utils', instance: this, callback: () => {
            return utils;
         }
      });
      createPrivateProperty({
         name: 'path', instance: this, callback: () => {
            return path;
         }
      });
      createPrivateProperty({
         name: 'vm', instance: this, callback: () => {
            return vm;
         }
      });
      createPrivateProperty({
         name: 'http', instance: this, callback: () => {
            return http;
         }
      });
   }
   register({ ref, Class, args = {} }) {
      if (!ref) {
         ref = getTypeRef({ Class });
      }
      const keys = Object.keys(args);
      for (const key of keys) {
         if (args[key] === null || args[key] === undefined) {
            throw new Error(`failed to register ${Class.name} for ref: ${ref}, one or more arguments is null or undefined.`);
         }
      }
      register.delete(ref);
      register.delete(Class);
      register.set(ref, Class);
      register.set(Class, args);
      const stack = objects.get(ref);
      createPrivateProperty({
         name: ref, instance: this, callback: () => {
            if (!registry.isRefRegistered({ ref })) {
               throw new Error(`ref: ${ref} is not registered.`);
            }
            const stack = objects.get(ref);
            let instance = stack && stack.length > 0 ? stack[0] : null;
            if (instance) {
               return instance;
            } else {
               const _classArgs = registry.getRegisteredTypeArgs({ ref });
               for (const { ref } of registry.getRegisteredTypes()) {
                  const otherStack = objects.get(ref);
                  const otherInstance = otherStack && otherStack.length > 0 ? otherStack[0] : null;
                  if (otherInstance) {
                     _classArgs[ref] = otherInstance;
                  }
               }
               instance = new Class(_classArgs);
               objects.delete(ref);
               objects.set(ref, [instance]); //create stack
               return instance;
            }
         }
      });
      stack && stack.length > 0 ? stack.shift() : null;
      return { ref };
   }
}

const getTypeRef = function ({ Class }) {
   let name = Class.name;
   name = name.charAt(0).toLowerCase() + name.slice(1);
   return name;
}

const createPrivateProperty = function ({ name, instance, callback }) {
   Object.defineProperty(instance, name, {
      configurable: false, get: function () {
         const caller = (new Error()).stack.split("\n")[2].trim().split(" ")[1];
         const callerSeg = caller.split('.');
         const callingFuncName = callerSeg[callerSeg.length - 1];
         const actualClassName = instance.constructor.name;
         const prototype = Object.getPrototypeOf(instance);
         if (caller === 'new') {
            return callback();
         }
         if (prototype[callingFuncName] && prototype[callingFuncName].name === callingFuncName && caller === `${actualClassName}.${callingFuncName}`) {
            return callback();
         }
         throw new Error(`Unable to access property: ${name}`);
      }
   });
}
