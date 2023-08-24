import utils from "utils";
const _references = new WeakMap();
let rootKey = {
   object: { name: 'rootKey', Id: utils.generateGUID() }
};
export class Reference {
   constructor({ Id, name, object, reference = null, bag = {} }) {
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
      if (typeof object === 'object') {
         throw new Error('object parameter must be an object');
      }
      if (reference && !(reference instanceof Reference)) {
         throw new Error(`reference is not an instance of ${Reference.name}`);
      }
      this.Id = Id;
      this.name = name;
      this.object = object;
      this.reference = reference;
      if (this.reference) {
         this.refId = reference.Id;
      }
      if (!_references.has(rootKey)) {
         _references.set(rootKey, [this]);
      } else {
         _references.get(rootKey).push(this);
      }
      if (!_references.has(object)) {
         _references.set(object, { Id, bag });
      }
   }
   /**
    * 
    * @param {Object} param0 
    * @returns { Reference [] }
    */
   static references(context) {
      const Id = Reference.Id(context);
      const currentRef = _references.get(rootKey).find(x => x.Id === Id);
      if (!currentRef) {
         throw new Error(`${context.Id} reference not found.`);
      }
      return _references.get(rootKey).filter(x => x.Id === currentRef.refId);
   }
   /**
    * 
    * @param {Object} param0 
    * @returns { Reference }
    */
   static reference(context) {
      const Id = Reference.Id(context);
      const currentRef = _references.get(rootKey).find(x => x.Id === Id);
      if (!currentRef) {
         throw new Error(`${context.Id} reference not found.`);
      }
      return currentRef;
   }
   /**
   * 
   * @param {Object} param0 
   * @returns { Object }
   */
   static bag(context) {
      const { bag } = _references.get(context);
      return bag;
   }
   /**
    * 
    * @param {Object} param0 
    * @returns { String }
    */
   static Id(context) {
      const { Id } = _references.get(context);
      return Id;
   }
}