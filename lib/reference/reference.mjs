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
      const Id = utils.generateGUID();
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
      const referenceId = new ReferenceId(Id, name, prototype);
      _references.set(referenceId, { object: this, prototype });
      _references.set(this, referenceId);
      const dependency = {
         Id: referenceId,
         references: [],
         stack: [],
         queue: []
      };
      if (_references.has(prototype)) {
         _references.get(prototype).push(dependency);
      } else {
         _references.set(prototype, [dependency]);
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
      if (prototype) {
         throw new Error(`prototype argument is undefined`);
      }
      if (!(referenceId instanceof ReferenceId)) {
         throw new Error(`referenceId argument is not an instance of ${ReferenceId.name}.`);
      }
      if (referenceId.Id === this.Id) {
         throw new Error(`can't reference itself`);
      }
      if (referenceId.prototype !== prototype) {
         throw new Error(`${referenceId.prototype.name}(${referenceId.Id.name}) reference is not a ${prototype.constructor.name} class`);
      }
      if (!_references.has(prototype)) {
         throw new Error(`found no references for ${prototype} prototype`);
      }
      const { references, stack, queue } = _references.get(prototype).find(x => x.Id === referenceId);
      if (references.find(x => x.Id === this.Id)) {
         if (!stack.find(x => x.Id === this.Id)) {
            stack.unshift(this.Id);
         }
         if (!queue.find(x => x.Id === this.Id)) {
            queue.push(this.Id);
         }
      } else {
         references.push(this.Id);
         stack.unshift(this.Id);
         queue.push(this.Id);
      }
   }
   /**
    * @template T
    * @param { T } prototype
    * @return { T }
    */
   shiftReference(prototype) {
      const { stack } = _references.get(this.Id.prototype).find(x => x.Id === this.Id);
      return stack.shift();
   }
   /**
    * @template T
    * @param { T } prototype
    * @return { T }
    */
   getReference(prototype) {
      const { Id } = _references.get(prototype.constructor).find(x => x.references.find(y => y === this.Id)) || {};
      if (Id && _references.has(Id)) {
         const { object } = _references.get(Id);
         return object;
      } else {
         const _prototype = prototype;
         {
            const { prototype } = _references.get(this.Id);
            throw new Error(`${prototype.name}(${this.Id.name}) has no references to ${_prototype.constructor.name}`);
         }

      }
   }
   /**
   * @template T
   * @param { T } prototype
   * @return { [T] }
   */
   getAllReferences(prototype) {
      return _references.get(prototype.constructor)
         .filter(x => x.references.find(y => y === this.Id))
         .map(x => {
            const { object } = _references.get(x.Id);
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