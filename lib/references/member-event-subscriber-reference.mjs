import { MemberEventReference } from "./member-event-reference.mjs";
import { MemberEventSubscriber } from "../member-event-subscriber.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventSubscriberReference extends Reference {
   /**
    * @param {String} name 
    */
   constructor(name) {
      this.Id = Reference.create(name, this, MemberEventSubscriber);
   }
   /**
    * @returns { MemberEventSubscriber }
    */
   get memberEventSubscriber() {
      return super.object;
   }
   /**
    * @returns { MemberEventReference }
    */
   get memberEventReference() {
      return super.dependencies(MemberEventReference);
   }
}      