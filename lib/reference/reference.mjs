import utils from "utils";
import { ReferenceId } from "./referenceId.mjs";
const _references = new WeakMap();
export class Reference {
   /**
    * @param {String} name
    */
   constructor(name) {
      if (new.target === Reference) {
         throw new Error('Container is an abstract class');
      }
      if (name) {
         if (typeof name !== 'string') {
            throw new Error('name parameter is not of type: string');
         }
      } else {
         throw new Error('name parameter is required');
      }
      const Class = this.constructor;
      if (!isClass(Class)) {
         throw new Error('Class parameter is not a Class');
      }
      if (!(this instanceof Class)) {
         throw new Error(`object is not an instance of ${Class.name}`);
      }
      const prototype = Object.getPrototypeOf(this).constructor;
      const Id = utils.generateGUID();
      const referenceId = new ReferenceId(Id, name, prototype);
      _references.set(referenceId, { object: this, prototype });
      _references.set(this, referenceId);

      const referencesId = utils.generateGUID();
      const referencesRefId = new ReferenceId(referencesId, `${name}_references`, WeakMap);
      _references.set(referencesRefId, new WeakMap());

      const stackId = utils.generateGUID();
      const stackReferenceId = new ReferenceId(stackId, `${name}_stack`, WeakMap);
      _references.set(stackReferenceId, new WeakMap());

      const queueId = utils.generateGUID();
      const queueReferenceId = new ReferenceId(queueId, `${name}_queue`, WeakMap);
      _references.set(queueReferenceId, new WeakMap());

      const correlation = { Id: referenceId, referencesRefId, stackReferenceId, queueReferenceId };
      if (_references.has(prototype)) {
         _references.get(prototype).push(correlation);
      } else {
         _references.set(prototype, [correlation]);
      }
   }
   /**
    * @returns { ReferenceId }
    */
   get Id() {
      return _references.get(this);
   }
   /**
    * @template T
    * @param {ReferenceId} referenceId
    * @param { T } prototype
    * @return { T }
    */
   addReference(referenceId, prototype) { //has to be an existing reference
      if (!prototype) {
         throw new Error(`prototype argument is undefined`);
      }
      if (!(referenceId instanceof ReferenceId)) {
         throw new Error(`referenceId argument is not an instance of ${ReferenceId.name}.`);
      }
      if (referenceId.Id === this.Id) {
         throw new Error(`can't reference itself`);
      }
      let _prototype = prototype;
      if (referenceId.prototype === prototype.constructor) {
         _prototype = _prototype.constructor;
      } else {
         if (Object.getPrototypeOf(referenceId.prototype) === prototype.constructor) {
            _prototype = referenceId.prototype;
         } else {
            throw new Error(`${referenceId.prototype.name}(${referenceId.Id.name}) reference is not a ${_prototype.constructor.name} class`);
         }
      }
      if (!_references.has(_prototype)) {
         throw new Error(`found no references for ${_prototype} prototype`);
      }
      const { referencesRefId, stackReferenceId, queueReferenceId } = _references.get(this.Id.prototype).find(x => x.Id === this.Id);
      const references = _references.get(referencesRefId);
      if (references.has(referenceId.prototype)) {
         if (!references.get(referenceId.prototype).find(x => x === referenceId)) {
            references.get(referenceId.prototype).push(referenceId);
         }
      } else {
         references.set(referenceId.prototype, [referenceId]);
      }
      const stack = _references.get(stackReferenceId);
      if (stack.has(referenceId.prototype)) {
         stack.get(referenceId.prototype).unshift(referenceId);
      } else {
         stack.set(referenceId.prototype, [referenceId]);
      }
      const queue = _references.get(queueReferenceId);
      if (queue.has(referenceId.prototype)) {
         queue.get(referenceId.prototype).push(referenceId);
      } else {
         queue.set(referenceId.prototype, [referenceId]);
      }
   }
   /**
    * @template T
    * @param { T } prototype
    * @return { T }
    */
   shiftStack(prototype) {
      const { stackReferenceId } = _references.get(this.Id.prototype).find(x => x.Id === this.Id);
      if (_references.get(stackReferenceId).has(prototype.constructor)) {
         const stack = _references.get(stackReferenceId).get(prototype.constructor);
         const stackRefId = stack.shift();
         const { object } = _references.get(stackRefId);
         return object;
      }
   }
   /**
   * @template T
   * @param { T } prototype
   * @return { T }
   */
   resetStack(prototype) {
      const { stackReferenceId, referencesRefId } = _references.get(this.Id.prototype).find(x => x.Id === this.Id);
      if (_references.get(stackReferenceId).has(prototype.constructor)) {
         const stack = _references.get(stackReferenceId).get(prototype.constructor);
         stack.splice(0, stack.length);
         const refs = _references.get(referencesRefId).get(prototype.constructor);
         for (const ref of refs) {
            stack.unshift(ref);
         }
      }
   }
   /**
    * @template T
    * @param { T } prototype
    * @return { T }
    */
   getReference(prototype) {
      const refs = this.getAllReferences(prototype);
      return refs[0];
   }
   /**
   * @template T
   * @param { T } prototype
   * @return { [T] }
   */
   getAllReferences(prototype) {
      return _references.get(this.Id.prototype)
         .filter(refA => refA.Id === this.Id)
         .reduce((refBArray, refA) => {
            const refs = _references.get(refA.referencesRefId).get(prototype.constructor);
            if (Array.isArray(refs)) {
               return refBArray.concat(refs);
            } else {
               return refBArray;
            }
         }, [])
         .map(refB => {
            const { object } = _references.get(refB);
            return object;
         });
   }
}
function isClass(v) {
   if (typeof v !== 'function') {
      return false;
   }
   try {
      v();
      return false;
   } catch (error) {
      if (/^Class constructor/.test(error.message)) {
         return true;
      }
      return false;
   }
}