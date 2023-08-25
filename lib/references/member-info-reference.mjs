import { ContainerReference } from "./container-reference.mjs";
import { MemberInfo } from "../member-info.mjs";
import { Reference } from "./reference.mjs";
export class MemberInfoReference extends Reference {
   constructor({ Id, name, object, references = [] }) {
      super({ Id, name, object, objectClass: MemberInfo, references });
   }
   /**
    * @returns { MemberInfo }
    */
   get memberInfo() {
      return super.object;
   }
   /**
    * @returns { { containerReference: ContainerReference } }
    */
   references() {
      return super.references();
   }
   /**
    * @returns { MemberInfoReference }
    */
   static reference() {
      return Reference.reference(MemberInfoReference);
   }
}      