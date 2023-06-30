import utils from 'utils'
import path from 'node:path'
import vm from 'node:v8'

const instances = new Map();
const registry = new Map();
const idMap = new WeakMap();

instances.set('$utils',utils);
instances.set('$path',path);
instances.set('$vm',vm);

class ContainerUtils {
   getObjectId(object) {
      const objectId = idMap.get(object);
      if (objectId === undefined) {
         const id = utils.generateGUID();
         idMap.set(object, id);
         return id;
      }
      return objectId;
   }
   getTypeRef(Type) {
      let name = Type.name;
      name = name.charAt(0).toLowerCase() + name.slice(1);
      return `$${name}`;
   }
}

export class Container extends ContainerUtils {
   get(ref) {
      let instance = instances.get(ref);
      if (instance) {
         const id = this.getObjectId(instance);
         return { id, instance };
      } else {
         const registeredType = registry.get(ref);
         if (registeredType) {
            const args = {};
            for(const key of instances.keys()) {
               args[key] = instances.get(key);
            }
            instance = new registeredType(args);
            instances.set(ref, instance);
            const id = this.getObjectId(instance);
            return { id, instance };
         } else {
            throw new Error(`could not find instance by reference: ${ref}`);
         }
      }
   }
   register(Type) {
      let ref = this.getTypeRef(Type);
      registry.set(ref, Type);
      return { ref };
   }
   isRegistered(Type) {
      let ref = this.getTypeRef(Type);
      const registeredType = registry.get(ref);
      if (registeredType === Type) {
         return true;
      }
      return false;
   }
}