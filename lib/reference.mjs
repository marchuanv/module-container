import utils from "utils";
const _references = new WeakMap();
let rootKey = {
   object: { name: 'rootKey', Id: utils.generateGUID() }
};
export class Reference {
   constructor({ object, reference = null, bag = {} }) {
      if (object) {
         if (typeof object === 'object') {
            if (object.name) {
               if (typeof object.name !== 'string') {
                  throw new Error('object name property is not of type: string');
               }
            } else {
               throw new Error('name is required for object');
            }
            if (!object.Id) {
               throw new Error('object requires an Id property');
            }
         } else {
            throw new Error('object parameter is not of type: object');
         }
      } else {
         throw new Error('object parameter is required');
      }
      if (reference && !(reference instanceof Reference)) {
         throw new Error(`reference is not an instance of ${Reference.name}`);
      }
      this.Id = object.Id;
      this.name = object.name;
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
         _references.set(object, bag);
      }
   }
   static create({ object, reference = null, bag = {} }) {
      return new Reference({ object, reference, bag });
   }
   static references({ Id }) {
      const currentRef = _references.get(rootKey).find(x => x.Id === Id);
      if (!currentRef) {
         throw new Error(`${Id} reference not found.`);
      }
      return _references.get(rootKey).filter(x => x.Id === currentRef.refId).reduce((objects, { object, reference }) => {
         objects[object.name] = object;
         if (reference) {
            const refs = Reference.references(reference);
            Object.assign(objects, refs);
         }
         return objects;
      }, {});
   }
   static get({ Id }) {
      return _references.get(rootKey).find(x => x.Id === Id);
   }
}