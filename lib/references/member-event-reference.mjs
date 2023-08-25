import { MemberEvent } from "../member-event.mjs";
import { MemberEventCallStackReference } from "./member-event-callstack-reference.mjs";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { MemberReference } from "./member-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventReference extends Reference {
   /**
    * @param {String} name 
    */
   constructor(name) {
      super(name, this, MemberEvent);
   }
   /**
    * @returns { MemberEvent }
    */
   get memberEvent() {
      return super.object;
   }
   /**
    * @returns { MemberReference }
    */
   get memberReference() {
      return super.dependencies(MemberReference);
   }
   /**
    * @returns { MemberInfoReference }
    */
   get memberInfoReference() {
      return super.dependencies(MemberInfoReference);
   }
   /**
    * @returns {MemberEventCallStackReference}
    */
   get memberEventCallStackReference() {
      return super.dependencies(MemberEventCallStackReference);
   }
}