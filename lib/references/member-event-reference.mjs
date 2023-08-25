import { MemberEventCallStackReference } from "./member-event-callstack-reference.mjs";
import { MemberEvent } from "../member-event.mjs";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { MemberReference } from "./member-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventReference extends Reference {
   constructor({ Id, name, object, references = [] }) {
      super({ Id, name, object, objectClass: MemberEvent, references });
   }
   /**
   * @returns { MemberEvent }
   */
   get memberEvent() {
      return super.object;
   }
   /**
    * @returns { { memberReference: MemberReference, memberInfoReference: MemberInfoReference, memberEventCallStackReference: MemberEventCallStackReference } }
    */
   references() {
      return super.references();
   }
   /**
    * @returns { MemberEventReference }
    */
   static reference() {
      return Reference.reference(MemberEventReference);
   }
}      