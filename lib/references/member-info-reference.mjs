import { ContainerReference } from "./container-reference.mjs";
import { MemberInfo } from "../member-info.mjs";
import { Reference } from "./reference.mjs";
export class MemberInfoReference extends Reference {
   /**
    * @param {String} name 
    */
   constructor(name) {
      this.Id = Reference.create(name, this, MemberInfo);
   }
   /**
    * @returns { MemberInfo }
    */
   get memberInfo() {
      return super.object;
   }
   /**
    * @returns { ContainerReference }
    */
   get containerReference() {
      return super.dependencies(ContainerReference);
   }
}      