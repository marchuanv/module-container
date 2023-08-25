import { Member } from "../member.mjs";
import { ContainerReference } from "./container-reference.mjs";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberReference extends Reference {
   /**
   * @param {String} name
   */
   constructor(name) {
      super(name, this, Member);
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