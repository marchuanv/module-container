// import utils from 'utils'
// import path from 'node:path'
// import vm from 'node:v8'
import { ContainerRegistry } from './container-registry.mjs'
import { ContainerUtils } from './container-utils.mjs'

// const instances = new Map();

// instances.set('$utils',utils);
// instances.set('$path',path);
// instances.set('$vm',vm);
// instances.set('$githubPrivateKey', process.env.GIT);

const registry = new ContainerRegistry();
const containerUtils = new ContainerUtils();

export class Container {
   constructor() {
      for(const { ref } of registry.getRegisteredTypes()) {
         Object.defineProperty(this, ref, { writable: false, configurable: false, get: ({ ref }) => {
            if (!registry.isRefRegistered({ ref })) {
               throw new Error(`ref: ${ref} is not registered.`);
            }
            let instance = this[ref];
            if (instance) {
               const id = containerUtils.getObjectId(instance);
               return { id, instance };
            } else {
               const Class = registry.getRegisteredType({ ref });
               const _classArgs = registry.getRegisteredTypeArgs({ ref });
               for(const { ref } of registry.getRegisteredTypes()) {
                  if (this[ref]) {
                     _classArgs[ref] = this[ref];
                  }
               }
               this[ref] = new Class(_classArgs);
               const id = containerUtils.getObjectId(instance);
               return { id, instance };
            }
         }});
      }
   }
}