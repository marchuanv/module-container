import { ContainerReference } from "./container-reference.mjs";
import { MemberInfo } from "../member-info.mjs";
import { Reference } from "./reference.mjs";
export class MemberInfoReference extends Reference {
   /**
   * @param {String} name 
   * @param {Object} object 
   * @returns { MemberInfoReference }
   */
   static create(name, object) {
      const memberInfoReference = new MemberInfoReference();
      memberInfoReference.Id = Reference.create(name, object, MemberInfo);
      return memberInfoReference;
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