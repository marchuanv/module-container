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
         dependantIds: [],
         data: {}
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
   * @returns { Object }
   */
   get object() {
      const { object } = _references.get(this.Id);
      return object;
   }
   /**
   * @returns { Class }
   */
   get Class() {
      const { Class } = _references.get(this.Id);
      return Class;
   }
   /**
    * @returns { Array<ReferenceId> }
    */
   get dependantIds() {
      const { dependantIds } = _references.get(this.Id);
      return dependantIds;
   }
   /**
    * @returns { String }
    */
   get name() {
      return this.Id.name;
   }
   /**
   * @returns { Object }
   */
   get data() {
      const { data } = _references.get(this.Id);
      return data;
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
      const existingRefId = this.dependantIds.find(x => x.Id === referenceId.Id);
      if (!existingRefId && _references.has(referenceId)) {
         this.dependantIds.unshift(referenceId);
      }
   }
   /**
    * @template T
    * @param { T } prototype
    * @return { T }
    */
   get(prototype) {
      let objectsThatMatchPrototype = [];
      let stack = this.dependantIds.map(x => x); //copy array
      let refId = stack.shift();
      while (refId) {
         const { object, Class } = _references.get(refId);
         if (object instanceof prototype.constructor && prototype.constructor === Class) {
            objectsThatMatchPrototype.unshift(object);
         }
         refId = stack.shift();
      }
      return objectsThatMatchPrototype[0];
   }
   /**
    * @template T
    * @param { T } prototype
    * @param { Function } filterCallback
    * @return { T }
    */
   has(prototype, filterCallback) {
      let objectsThatMatchPrototype = [];
      let stack = this.dependantIds.map(x => x); //copy array
      let refId = stack.shift();
      while (refId) {
         const { object, Class } = _references.get(refId);
         if (object instanceof prototype.constructor && prototype.constructor === Class) {
            if (filterCallback(object)) {
               objectsThatMatchPrototype.unshift(object);
            }
         }
         refId = stack.shift();
      }
      return objectsThatMatchPrototype[0];
   }
   /**
   * @template T
   * @param { T } prototype
   * @return { [T] }
   */
   getDependencies(prototype) {
      let objectsThatMatchPrototype = [];
      let stack = this.dependantIds.map(x => x); //copy array
      let refId = stack.shift();
      while (refId) {
         const { object, Class } = _references.get(refId);
         if (object instanceof prototype.constructor && prototype.constructor === Class) {
            objectsThatMatchPrototype.unshift(object);
         }
         refId = stack.shift();
      }
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