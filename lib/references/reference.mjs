import utils from "utils";
import { ReferenceId } from "./referenceId.mjs";
import { ReferenceKey } from "./referencekey.mjs";
const _references = new WeakMap();
_references.set(ReferenceKey, new WeakMap());
const referenceKeys = _references.get(ReferenceKey);
export class Reference {
   /**
    * @param {String} name 
    * @param {Object} object 
    * @param {Class} Class 
    */
   constructor(name, object, Class) {
      const Id = utils.generateGUID();
      if (name) {
         if (typeof name !== 'string') {
            throw new Error('name parameter is not of type: string');
         }
      } else {
         throw new Error('name parameter is required');
      }
      if (!object) {
         throw new Error('object parameter is required');
      }
      if (!Class) {
         throw new Error('Class parameter is required');
      }
      if (!isClass(Class)) {
         throw new Error('Class parameter is not a Class');
      }
      if (!(object instanceof Class)) {
         throw new Error(`object is not an instance of ${Class.name}`);
      }
      const referenceKey = new ReferenceKey(Id, name, []);
      referenceKeys.set(referenceKey);
      _references.set(referenceKey, { object, tyoe: Class });
      _references.set(this, new ReferenceId(Id));
   }
   /**
    * @returns { ReferenceId }
    */
   get Id() {
      return _references.get(this);
   }
   /**
    * @param {ReferenceId} referenceId 
    * @returns { Object }
    */
   getData(referenceId) {
      return _references.get(referenceId);
   }
   /**
   * @param {Object} data 
   * @returns { ReferenceId }
   */
   setData(data) {
      const id = utils.generateGUID();
      const referenceId = new ReferenceId(id);
      _references.set(referenceId, data);
      return referenceId;
   }
   /**
   * @returns { Object }
   */
   get object() {
      const thisRefKey = referenceKeys.find(x => x.Id === this.Id);
      const { object } = _references.get(thisRefKey);
      return object;
   }
   /**
    * @returns { String }
    */
   get name() {
      const thisRefKey = referenceKeys.find(x => x.Id === this.Id);
      return thisRefKey.name;
   }
   /**
    * @returns { Array<ReferenceKey> }
    */
   get dependantKeys() {
      const depRefKeys = [];
      const thisRefKey = referenceKeys.find(x => x.Id === this.Id);
      for (const { Id } of thisRefKey.dependantKeys) {
         const referencedKey = referenceKeys.find(x => x.Id === Id);
         if (referencedKey) {
            depRefKeys.unshift(referencedKey);
         }
      }
      return utils.getJSONObject(utils.getJSONString(depRefKeys));
   }
   /**
    * @param {ReferenceId} referenceId 
    */
   set dependency(referenceId) {
      if (!(referenceId instanceof ReferenceId)) {
         throw new Error(`referenceKey parameter is not a ${ReferenceKey.name} class.`);
      }
      const existingRefKey = referenceKeys.find(x => x.Id === referenceId.Id);
      if (existingRefKey) {
         if (!_references.has(existingRefKey)) {
            throw new Error(`there is no reference to ${utils.getJSONObject(existingRefKey)}`);
         }
         const thisRefKey = referenceKeys.find(x => x.Id === this.Id);
         thisRefKey.dependantKeys.unshift(existingRefKey);
      } else {
         throw new Error(`reference key ${utils.getJSONString(referenceKey)} does not exist.`);
      }
   }
   /**
    * @param {Class} Class 
    * @returns { Array<Class> }
    */
   dependencies(Class) {
      if (!isClass(Class)) {
         throw new Error('Class parameter is not a Class');
      }
      const _dependencies = [];
      for (const key of this.dependantKeys) {
         const { type, object } = _references.get(key);
         if (type === Class) {
            _dependencies.unshift(object);
         }
      }
      return _dependencies;
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