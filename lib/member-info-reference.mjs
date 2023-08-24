import { MemberInfo } from "./member-info.mjs";
import { Reference } from "./reference.mjs";
export class MemberInfoReference extends Reference {
   constructor({ Id, name, object, reference = null, bag = {} }) {
      if (!(object instanceof MemberInfo)) {
         throw new Error(`object is not an instance of ${Member.name}`);
      }
      super({ Id, name, object, reference, bag });
   }
   /**
    * @returns { MemberInfo }
    */
   static memberInfo(context) {
      return Reference.get(context);
   }
}      