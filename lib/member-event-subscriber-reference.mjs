import { MemberEventSubscriber } from "./member-event-subscriber.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventSubscriberReference extends Reference {
   constructor({ Id, name, object, reference = null, bag = {} }) {
      if (!(object instanceof MemberEventSubscriber)) {
         throw new Error(`object is not an instance of ${Member.name}`);
      }
      super({ Id, name, object, reference, bag });
   }
   /**
    * @returns { MemberEventSubscriber }
    */
   static memberEventSubscriber(context) {
      return Reference.object(context);
   }
}      