import utils from "utils";
const _references = new WeakMap();
class ReferenceKey {
   /**
    * @param {String} Id
    * @param {String} name
    * @param {Array<ReferenceKey>} dependantKeys 
    */
   constructor(Id, name, dependantKeys) {
      this._id = Id;
      this._name = name;
      this._dependantKeys = dependantKeys;
   }
   /**
    * @returns { String }
    */
   get Id() {
      return this._id;
   }
   /**
    * @returns { String }
    */
   get name() {
      return this._name;
   }
   /**
    * @returns { Array }
    */
   get dependantKeys() {
      return this._dependantKeys;
   }
}
_references.set(ReferenceKey, new WeakMap());
const referenceKeys = _references.get(ReferenceKey);
export class Reference {
   /**
    * 
    * @param {String} name 
    * @param {Object} object 
    * @param {Class} Class 
    * @returns { String }
    */
   static create(name, object, Class) {
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
      return Id;
   }
   /**
    * @param {String} Id
    */
   set Id(Id) {
      _references.set(this, Id);
   }
   /**
    * @returns { String }
    */
   get Id() {
      return _references.get(this);
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
    * @param {ReferenceKey} referenceKey 
    */
   set dependency(referenceKey) {
      if (!(referenceKey instanceof ReferenceKey)) {
         throw new Error(`referenceKey parameter is not a ${ReferenceKey.name} class.`);
      }
      const existingRefKey = referenceKeys.find(x => x.Id === referenceKey.Id);
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