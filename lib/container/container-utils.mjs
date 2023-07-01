import utils from 'utils'
const idMap = new WeakMap();
export class ContainerUtils {
   getObjectId(object) {
      const objectId = idMap.get(object);
      if (objectId === undefined) {
         const id = utils.generateGUID();
         idMap.set(object, id);
         return id;
      }
      return objectId;
   }
   getTypeRef({ type }) {
      let name = type.name;
      name = name.charAt(0).toLowerCase() + name.slice(1);
      return `$${name}`;
   }
}