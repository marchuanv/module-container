import { ContainerReference } from "./container-reference.mjs";
import { MemberInfo } from "./member-info.mjs";
import { Reference } from "./reference.mjs";
export class MemberInfoReference extends Reference {
   constructor({ Id, name, object, reference = null, bag = {} }) {
      if (!(object instanceof MemberInfo)) {
         throw new Error(`object is not an instance of ${MemberInfo.name}`);
      }
      super({ Id, name, object, reference, bag });
   }
   /**
    * @returns { MemberInfo }
    */
   get memberInfo() {
      return this.object;
   }
   /**
    * @returns { { containerReference: ContainerReference } }
    */
   references() {
      return Reference.references(this);
   }
   /**
    * @returns { MemberInfoReference }
    */
   static reference(context) {
      return Reference.reference(context);
   }
}      