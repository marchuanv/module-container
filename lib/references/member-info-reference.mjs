import { MemberInfo } from "../member-info.mjs";
import { ContainerReference } from "./container-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberInfoReference extends Reference {
   /**
    * @param {String} name
    */
   constructor(name) {
      super(name, this, MemberInfo);
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