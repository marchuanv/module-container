import { Container } from "../container.mjs";
import { Reference } from "./reference.mjs";
export class ContainerReference extends Reference {
   /**
   * @param {String} name 
   * @param {Object} object 
   * @returns { ContainerReference }
   */
   static create(name, object) {
      const containerReference = new ContainerReference();
      containerReference.Id = Reference.create(name, object, Container);
      return containerReference;
   }
   /**
    * @returns { Container }
    */
   get container() {
      return super.object;
   }
}
