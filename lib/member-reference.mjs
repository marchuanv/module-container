import { ContainerReference } from "./container-reference.mjs";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { Member } from "./member.mjs";
import { Reference } from "./reference.mjs";
export class MemberReference extends Reference {
   constructor({ Id, name, object, reference = null, bag = {} }) {
      if (!(object instanceof Member)) {
         throw new Error(`object is not an instance of ${Member.name}`);
      }
      super({ Id, name, object, reference, bag });
   }
   /**
    * @returns { Member }
    */
   get member() {
      return this.object;
   }
   /**
    * @returns { { containerReference: ContainerReference, memberInfoReference: MemberInfoReference } }
    */
   references() {
      return Reference.references(this);
   }
   /**
    * @returns { MemberReference }
    */
   static reference(context) {
      return Reference.reference(context);
   }
}      