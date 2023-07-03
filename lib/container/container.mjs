
import utils from 'utils'
import path from 'node:path'
import vm from 'node:v8'
import http from 'node:http'
import { ContainerRegistry } from './container-registry.mjs'
import { ContainerUtils } from './container-utils.mjs'

const registry = new ContainerRegistry();
const containerUtils = new ContainerUtils();
const instances = new Map();

export class Container {
   constructor() {
      instances.set('$garbage', []);
      instances.set('$utils', utils);
      instances.set('$path', path);
      instances.set('$vm', vm);
      instances.set('$http', http);
      createProperty(this, '$utils');
      createProperty(this, '$path');
      createProperty(this, '$vm');
      createProperty(this, '$http');
      for (const { ref } of registry.getRegisteredTypes()) {
         if (ref && typeof ref === 'string' && ref.indexOf('$') > -1) {
            createProperty(this, ref);
         }
      }
   }
   flagAsGarbage({ ref }) {
      const $garbage = instances.get('$garbage');
      $garbage.push({ ref });
   }
}

const createProperty = function (container, ref) {
   Object.defineProperty(container, ref, {
      configurable: false, get: () => {
         const $garbage = instances.get('$garbage');
         const garbageRef = $garbage.find(g => g.ref === ref);
         if (garbageRef) {
            throw new Error(`${ref} was flagged for garbage collection.`);
         }
         if (!registry.isRefRegistered({ ref })) {
            throw new Error(`ref: ${ref} is not registered.`);
         }
         let instance = instances.get(ref);
         if (instance) {
            const id = containerUtils.getObjectId(instance);
            return instance;
         } else {
            const Class = registry.getRegisteredType({ ref });
            const _classArgs = registry.getRegisteredTypeArgs({ ref });
            for (const { ref } of registry.getRegisteredTypes()) {
               const otherInstance = instances.get(ref);
               if (otherInstance) {
                  _classArgs[ref] = otherInstance;
               }
            }
            instance = new Class(_classArgs);
            instances.set(ref, instance);
            return instance;
         }
      }
   });
}