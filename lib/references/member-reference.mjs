import { ContainerReference } from "./container-reference.mjs";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { Member } from "../member.mjs";
import { Reference } from "./reference.mjs";
export class MemberReference extends Reference {
   /**
    * @param {String} name 
    * @param {Object} object 
    * @returns { MemberReference }
    */
   static create(name, object) {
      const memberReference = new MemberReference();
      memberReference.Id = Reference.create(name, object, Member);
      return memberReference;
   }
   /**
    * @returns { Member }
    */
   get member() {
      return super.object;
   }
   /**
    * @returns { ContainerReference }
    */
   get containerReference() {
      return super.dependencies(ContainerReference);
   }
   /**
    * @returns { MemberInfoReference }
    */
   get memberInfoReference() {
      return super.dependencies(MemberInfoReference);
   }
}      