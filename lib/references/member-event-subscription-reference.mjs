import { Reference } from "./reference.mjs";
import { MemberEventSubscription } from "../member-event-subscription.mjs";
import { MemberEventQueue } from "../member-event-queue.mjs";
export class MemberEventSubscriptionReference extends Reference {
   /**
    * @param {String} name 
    */
   constructor(name) {
      super(name, this, MemberEventSubscription);
   }
   /**
   * @returns { MemberEventQueue }
   */
   get memberEventQueue() {
      return super.dependencies(MemberEventQueue);
   }
}      