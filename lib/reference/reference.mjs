import utils from "utils";
import { ReferenceId } from "./referenceId.mjs";
const _references = new WeakMap();
_references.set(ReferenceId, []);
export class Reference {
   /**
    * @param {String} name
    */
   constructor(name) {
      if (new.target === Reference) {
         throw new Error('Container is an abstract class');
      }
      const Class = this.constructor;
      const Id = utils.generateGUID();
      if (name) {
         if (typeof name !== 'string') {
            throw new Error('name parameter is not of type: string');
         }
      } else {
         throw new Error('name parameter is required');
      }
      if (!Class) {
         throw new Error('Class parameter is required');
      }
      if (!isClass(Class)) {
         throw new Error('Class parameter is not a Class');
      }
      if (!(this instanceof Class)) {
         throw new Error(`object is not an instance of ${Class.name}`);
      }
      if (!(this instanceof Reference)) {
         throw new Error(`object is not an instance of ${Reference.name}`);
      }
      const referenceId = new ReferenceId(Id, name, []);
      addReferenceId(referenceId);
      _references.set(referenceId, {
         object: this,
         Class,
         dependantReferenceIds: []
      });
      _references.set(this, referenceId);
   }
   /**
    * @returns { ReferenceId }
    */
   get Id() {
      return _references.get(this);
   }
   /**
    * @returns { String }
    */
   get name() {
      return this.Id.name;
   }
   /**
    * @param {ReferenceId} referenceId
    */
   set dependency(referenceId) { //has to be an existing reference
      if (!(referenceId instanceof ReferenceId)) {
         throw new Error(`referenceId parameter is not a ${ReferenceId.name} class.`);
      }
      if (referenceId.Id === this.Id) {
         throw new Error(`can't reference itself`);
      }
      const { dependantReferenceIds } = _references.get(this.Id);
      const existingRefId = dependantReferenceIds.find(x => x.Id === referenceId.Id);
      if (!existingRefId && _references.has(referenceId)) {
         dependantReferenceIds.unshift(referenceId);
      }
   }
   /**
    * @template T
    * @param { T } prototype
    * @param { Boolean } keepReferenceId
    * @param { Function } callback
    * @return { T }
    */
   shift(prototype, keepReferenceId = false, callback = null) {
      const { dependantReferenceIds } = _references.get(this.Id);
      let refId = dependantReferenceIds.shift();
      let startedRefId = refId;
      while (refId) {
         if (keepReferenceId) {
            dependantReferenceIds.push(refId); //push to the end
         }
         const { object, Class } = _references.get(refId);
         if (object instanceof prototype.constructor && (prototype.constructor === Class || prototype.constructor === Object.getPrototypeOf(Class))) {
            if (callback instanceof Function) {
               callback(object)
            } else {
               return object;
            }
         }
         refId = dependantReferenceIds.shift();
         if (refId === startedRefId) {
            if (callback instanceof Function) {
               return callback(null)
            } else {
               return null;
            }
         }
      }
   }
   /**
    * @template T
    * @param { T } prototype
    * @return { T }
    */
   get(prototype) {
      return this.shift(prototype, true);
   }
   /**
   * @template T
   * @param { T } prototype
   * @return { [T] }
   */
   getDependencies(prototype) {
      let objectsThatMatchPrototype = [];
      this.shift(prototype, true, (object) => {
         if (object) {
            objectsThatMatchPrototype.unshift(object);
         }
      });
      return objectsThatMatchPrototype;
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
/**
 * @param { ReferenceId } referenceId
 */
const addReferenceId = (referenceId) => {
   _references.get(ReferenceId).shift(referenceId);
}