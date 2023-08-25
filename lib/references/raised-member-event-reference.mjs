import { RaisedMemberEvent } from "../raised-member-event.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { Reference } from "./reference.mjs";
export class RaisedMemberEventReference extends Reference {
   /**
    * @param {String} name 
    * @param {Object} object 
    * @returns { RaisedMemberEventReference }
    */
   static create(name, object) {
      const referenceId = Reference.create(name, object, RaisedMemberEvent);
      const raisedMemberEventReference = new RaisedMemberEventReference();
      raisedMemberEventReference.Id = referenceId;
      return raisedMemberEventReference;
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