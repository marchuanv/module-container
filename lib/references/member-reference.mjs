import { ContainerReference } from "./container-reference.mjs";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { Member } from "../member.mjs";
import { Reference } from "./reference.mjs";
export class MemberReference extends Reference {
   constructor({ Id, name, object, references = [] }) {
      super({ Id, name, object, objectClass: Member, references });
   }
   /**
    * @returns { Member }
    */
   get member() {
      return super.object;
   }
   /**
    * @returns { { containerReference: ContainerReference, memberInfoReference: MemberInfoReference } }
    */
   references() {
      return super.references();
   }
   /**
    * @returns { MemberReference }
    */
   static reference() {
      return Reference.reference(MemberReference);
   }
}      