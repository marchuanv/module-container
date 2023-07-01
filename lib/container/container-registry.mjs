import { ContainerUtils } from "./container-utils.mjs";
const registry = new Map();
const containerUtils = new ContainerUtils();
export class ContainerRegistry {
   register({ ref, type, args = [] }) {
      registry.set(ref, type);
      registry.set(type, args);
   }
   isRegistered({ ref, type }) {
      const registeredType = registry.get(ref);
      if (registeredType === type) {
         return true;
      }
      return false;
   }
   registerSingleton({ type, args }) {
      let ref = containerUtils.getTypeRef({ type });
      this.register({ ref, type, args });
      return { ref };
   }
   isSingletonRegistered({ type }) {
      const ref = containerUtils.getTypeRef({ type });
      return this.isRegistered({ ref, type });
   }
   isRefRegistered({ ref }) {
      const type = registry.get(ref);
      return this.isRegistered({ ref, type });
   }
   getRegisteredType({ ref }) {
      return registry.get(ref);
   }
   getRegisteredTypeArgs({ ref }) {
      const type = this.getRegisteredType({ ref });
      return registry.get(type);
   }
   getRegisteredTypes() {
      const registeredKeys = [];
      for(const key of registry.keys()) {
         registeredKeys.push(key);
      }
      return registeredKeys.map(ref => { return { ref, type: registry.get(ref) } });
   }
}