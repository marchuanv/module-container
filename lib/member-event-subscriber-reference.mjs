import { MemberEventReference } from "./member-event-reference.mjs";
import { MemberEventSubscriber } from "./member-event-subscriber.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventSubscriberReference extends Reference {
   constructor({ Id, name, object, reference = null, bag = {} }) {
      if (!(object instanceof MemberEventSubscriber)) {
         throw new Error(`object is not an instance of ${MemberEventSubscriber.name}`);
      }
      super({ Id, name, object, reference, bag });
   }
   /**
    * @returns { MemberEventSubscriber }
    */
   get memberEventSubscriber() {
      return this.object;
   }
   /**
    * @returns { { memberEventReference: MemberEventReference } }
    */
    references() {
      return Reference.references(this);
   }
   /**
    * @returns { MemberEventSubscriberReference }
    */
   static reference(context) {
      return Reference.reference(context);
   }
}      