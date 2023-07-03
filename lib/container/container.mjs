
import utils from 'utils'
import path from 'node:path'
import vm from 'node:v8'
import http from 'node:http'
import { ContainerRegistry } from './container-registry.mjs'

const registry = new ContainerRegistry();
const objects = new Map();
const idMap = new WeakMap();

function getObjectId(object) {
   const objectId = idMap.get(object);
   if (objectId === undefined) {
      const id = utils.generateGUID();
      idMap.set(object, id);
      return id;
   }
   return objectId;
}

function peekStack({ stack }) {
   if (stack && stack.length > 0) {
      return stack[0]; //peek stack
   }
}

function popStack({ stack }) {
   if (stack && stack.length > 0) {
      const removedInstance = stack.shift(); //remove from stack
      return getObjectId(removedInstance);
   }
}

export class Container {
   constructor() {
      objects.set('$utils',  [ utils ]);
      objects.set('$path', [ path ]);
      objects.set('$vm', [ vm ]);
      objects.set('$http', [ http ]);
      createProperties(this, '$utils');
      createProperties(this, '$path');
      createProperties(this, '$vm');
      createProperties(this, '$http');
      for (const { ref } of registry.getRegisteredTypes()) {
         if (ref && typeof ref === 'string' && ref.indexOf('$') > -1) {
            createProperties(this, ref);
         }
      }
   }
}

const createProperties = function (container, ref) {
   Object.defineProperty(container, ref, { configurable: false, get: () => {
         if (!registry.isRefRegistered({ ref })) {
            throw new Error(`ref: ${ref} is not registered.`);
         }
         const stack = objects.get(ref);
         let instance = peekStack({ stack });
         if (instance) {
            return instance;
         } else {
            const Class = registry.getRegisteredType({ ref });
            const _classArgs = registry.getRegisteredTypeArgs({ ref });
            for (const { ref } of registry.getRegisteredTypes()) {
               const otherStack = objects.get(ref);
               const otherInstance = peekStack({ stack: otherStack });
               if (otherInstance) {
                  _classArgs[ref] = otherInstance;
               }
            }
            instance = new Class(_classArgs);
            Object.defineProperty(instance, 'objectId', { configurable: false, get: () => {
               const stack = objects.get(ref);
               const instance = peekStack({ stack });
               if (instance) {
                  return getObjectId(instance);
               }
            }});
            Object.defineProperty(instance, 'collect', { configurable: false, value: () => {
               const stack = objects.get(ref);
               return popStack({ stack });
            }});
            objects.set(ref, [ instance ]); //create stack
            getObjectId(instance);
            return instance;
         }
      }
   });
}