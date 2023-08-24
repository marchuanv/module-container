import { EventCallStackReference, MemberEventCallStackReference } from "./member-event-callstack-reference.mjs";
import { MemberEvent } from "./member-event.mjs";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { MemberReference } from "./member-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventReference extends Reference {
   constructor({ Id, name, object, reference = null, bag = {} }) {
      if (!(object instanceof MemberEvent)) {
         throw new Error(`object is not an instance of ${MemberEvent.name}`);
      }
      super({ Id, name, object, reference, bag });
   }
   /**
   * @returns { MemberEvent }
   */
   get memberEvent() {
      return this.object;
   }
   /**
    * @returns { { memberReference: MemberReference, memberInfoReference: MemberInfoReference, memberEventCallStackReference: MemberEventCallStackReference } }
    */
   references() {
      return Reference.references(this);
   }
   /**
    * @returns { MemberEventReference }
    */
   static reference(context) {
      return Reference.reference(context);
   }
}      