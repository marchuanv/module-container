import utils from 'utils'
import path from 'node:path'
import vm from 'node:v8'
import { 
   ContainerRegistry,
   ContainerUtils
 } from './index.mjs';

const instances = new Map();

instances.set('$utils',utils);
instances.set('$path',path);
instances.set('$vm',vm);
instances.set('$githubPrivateKey', process.env.GIT);

const registry = new ContainerRegistry();
const containerUtils = new ContainerUtils();

export class Container {
   /**
    * 
    * @param {ContainerRegistry} containerRegistry 
    */   
   constructor(containerRegistry) {
      registry.merge(containerRegistry);
   }
   get(ref) {
      if (!this.isRefRegistered({ ref })) {
         throw new Error(`ref: ${ref} is not registered.`);
      }
      let instance = instances.get(ref);
      if (instance) {
         const id = containerUtils.getObjectId(instance);
         return { id, instance };
      } else {
         const Class = registry.getRegisteredType({ ref });
         const _classArgs = registry.getRegisteredTypeArgs({ ref });
         for(const key of instances.keys()) {
            _classArgs[key] = instances.get(key);
         }
         instance = new Class(args);
         instances.set(ref, instance);
         const id = containerUtils.getObjectId(instance);
         return { id, instance };
      }
   }
}