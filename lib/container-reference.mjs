import { Container } from "./container.mjs";
import { Reference } from "./reference.mjs";
export class ContainerReference extends Reference {
   constructor({ Id, name, object, reference = null, bag = {} }) {
      if (!(object instanceof Container)) {
         throw new Error(`object is not an instance of ${Container.name}`);
      }
      super({ Id, name, object, reference, bag });
   }
   /**
    * @returns { Container }
    */
   static container(context) {
      return Reference.object(context);
   }
}      