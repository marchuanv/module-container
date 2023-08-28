import { MemberEventPublisher } from "../member-event-publisher.mjs";
import { MemberEventQueue } from "../member-event-queue.mjs";
import { MemberEvent } from "../member-event.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventPublisherReference extends Reference {
   /**
    * @param {String} name
    */
   constructor(name) {
      super(name, this, MemberEventPublisher);
   }
   /**
    * @returns { MemberEvent }
    */
   get memberEvent() {
      return super.dependencies(MemberEvent);
   }
   /**
   * @returns { MemberEventQueue }
   */
   get memberEventQueue() {
      return super.dependencies(MemberEventQueue);
   }
}