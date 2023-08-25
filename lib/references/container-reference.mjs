import { Container } from "../container.mjs";
import { Reference } from "./reference.mjs";
export class ContainerReference extends Reference {
   constructor({ Id, name, object, references = [] }) {
      super({ Id, name, object, objectClass: Container, references });
   }
   /**
     * @returns { Container }
    */
   get container() {
      return super.object;
   }
   /**
    * @returns { {  } }
    */
   references() {
      return super.references();
   }
   /**
   * @returns { ContainerReference }
   */
   static reference() {
      return Reference.reference(ContainerReference);
   }
}      