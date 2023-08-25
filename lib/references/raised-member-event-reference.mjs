import { MemberEvent } from "../member-event.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { MemberReference } from "./member-reference.mjs";
import { Reference } from "./reference.mjs";
export class RaisedMemberEventReference extends Reference {
   constructor({ Id, name, object }) {
      super({ Id, name, object, objectClass: MemberEvent, references });
   }
   /**
   * @returns { MemberEvent }
   */
   get memberEvent() {
      return super.object;
   }
   /**
    * @returns { { memberEventReference: MemberEventReference } }
    */
   references() {
      return super.references(this);
   }
   /**
    * @returns { MemberReference }
    */
   static reference() {
      return Reference.reference(MemberReference);
   }
}