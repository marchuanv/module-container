import { MemberEventReference } from "./member-event-reference.mjs";
import { MemberEventSubscriber } from "../member-event-subscriber.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventSubscriberReference extends Reference {
   /**
    * @param {String} name 
    * @param {Object} object 
    * @returns { MemberEventSubscriberReference }
    */
   static create(name, object) {
      const memberEventSubscriberReference = new MemberEventSubscriberReference();
      memberEventSubscriberReference.Id = Reference.create(name, object, MemberEventSubscriber);
      return memberEventSubscriberReference;
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