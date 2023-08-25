import utils from "utils";
const _references = new WeakMap();
_references.set(Reference, new Map());
export class Reference {
   constructor({ Id, name, object, objectClass, references = [] }) {
      if (Id) {
         if (typeof Id !== 'string') {
            throw new Error('Id parameter is not of type: string');
         }
      } else {
         throw new Error('Id parameter is required');
      }
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
      if (!objectClass) {
         throw new Error('objectClass parameter is required');
      }
      if (!isClass(_class)) {
         throw new Error('_class parameter is not a Class');
      }
      if (!(object instanceof objectClass)) {
         throw new Error(`object is not an instance of ${objectClass.name}`);
      }
      if (!Array.isArray(references)) {
         throw new Error('references parameter must be an array');
      }
      for (const ref of references) {
         if (!(ref instanceof Reference)) {
            throw new Error(`one or more reference is not an instance of ${Reference.name}`);
         }
         if (!_references.has(ref)) {
            throw new Error(`one or more references does not exist`);
         }
      }
      this.Id = Id;
      this.name = name;
      const referenceType = this.constructor;
      _references.set(this, object);
      _references.set(referenceType, this);
      if (_references.get(Reference).has(Id)) {
         throw new Error(`reference with Id already exist`);
      }
      _references.get(Reference).set(Id, { reference: this, references });
   }
   /**
   * 
   * @returns { Object }
   */
   get object() {
      return _references.get(this);
   }
   /**
    * 
    * @returns { Reference [] }
    */
   get references() {
      const Id = this.Id;
      const { references } = _references.get(Reference).get(Id);
      return references;
   }
   /**
    * 
    * @param {Class} _class 
    * @returns { Reference [] }
    */
   static references(_class) {
      if (!_class) {
         throw new Error('referenceType parameter is required');
      }
      if (!isClass(_class)) {
         throw new Error(`referenceType parameter is not a class`);
      }
      const ref = _references.get(_class);
      return ref.references();
   }
   /**
    * 
    * @param {Class} _class
    * @returns { Reference }
    */
   static reference(_class) {
      if (!_class) {
         throw new Error('referenceType parameter is required');
      }
      if (!isClass(_class)) {
         throw new Error(`referenceType parameter is not a class`);
      }
      return _references.get(_class);
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