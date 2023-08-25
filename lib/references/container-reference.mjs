import { Container } from "../container.mjs";
import { Reference } from "./reference.mjs";
export class ContainerReference extends Reference {
   /**
     * @param {String} name 
     */
   constructor(name) {
      this.Id = Reference.create(name, this, Container);
   }
   /**
    * @returns { Container }
    */
   get container() {
      return super.object;
   }
}
