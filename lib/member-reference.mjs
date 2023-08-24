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
   static member(context) {
      return Reference.object(context);
   }
}      