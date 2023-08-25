import { MemberEventReference } from "./member-event-reference.mjs";
import { MemberEventSubscriber } from "../member-event-subscriber.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventSubscriberReference extends Reference {
   constructor({ Id, name, object, references = [] }) {
      super({ Id, name, object, objectClass: MemberEventSubscriber, references });
   }
   /**
    * @returns { MemberEventSubscriber }
    */
   get memberEventSubscriber() {
      return super.object;
   }
   /**
    * @returns { { memberEventReference: MemberEventReference } }
    */
   references() {
      return super.references();
   }
   /**
    * @returns { MemberEventSubscriberReference }
    */
   static reference() {
      return Reference.reference(MemberEventSubscriberReference);
   }
}      