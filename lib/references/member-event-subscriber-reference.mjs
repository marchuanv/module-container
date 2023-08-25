import { MemberEventQueue } from "../member-event-queue.mjs";
import { MemberEventSubscriber } from "../member-event-subscriber.mjs";
import { Member } from "../member.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventSubscriberReference extends Reference {
   /**
    * @param {String} name
    */
   constructor(name) {
      super(name, this, MemberEventSubscriber);
   }
   /**
    * @returns { Member }
    */
   get member() {
      return super.dependencies(Member);
   }
   /**
   * @returns { MemberEventQueue }
   */
   get memberEventQueue() {
      return super.dependencies(MemberEventQueue);
   }
}