import { MemberEvent } from "./member-event.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventReference extends Reference {
   constructor({ Id, name, object, reference = null, bag = {} }) {
      if (!(object instanceof MemberEvent)) {
         throw new Error(`object is not an instance of ${MemberEventReference.name}`);
      }
      super({ Id, name, object, reference, bag });
   }
   /**
    * @returns { MemberEvent }
    */
   static event(context) {
      return Reference.object(context);
   }
}      