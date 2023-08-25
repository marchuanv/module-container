import { RaisedMemberEvent } from "../raised-member-event.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { Reference } from "./reference.mjs";
export class RaisedMemberEventReference extends Reference {
   /**
   * @param {String} name 
   */
   constructor(name) {
      this.Id = Reference.create(name, this, RaisedMemberEvent);
   }
   /**
   * @returns { RaisedMemberEvent }
   */
   get raisedMemberEvent() {
      return super.object;
   }
   /**
    * @returns { MemberEventReference }
    */
   get memberEventReference() {
      return super.dependencies(MemberEventReference);
   }
}