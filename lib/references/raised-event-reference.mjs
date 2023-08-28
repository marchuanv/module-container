import { MemberEvent } from "../member-event.mjs";
import { RaisedEvent } from "../raised-event.mjs";
import { Reference } from "./reference.mjs";
export class RaisedEventReference extends Reference {
   /**
   * @param {String} name
   */
   constructor(name) {
      super(name, this, RaisedEvent);
   }
   /**
    * @returns { MemberEvent }
    */
   get memberEvent() {
      return super.dependencies(MemberEvent);
   }
}