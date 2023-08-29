import { MemberEventCallStack } from "./member-event-callstack.mjs";
import { MemberEventPublisher } from "./member-event-publisher.mjs";
import { MemberEventQueue } from "./member-event-queue.mjs";
import { MemberEventSubscription } from "./member-event-subscription.mjs";
import { MemberEvent } from "./member-event.mjs";
import { Member } from "./member.mjs";
import { RaisedEventLogging } from "./raised-event-logging.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
const memberEventQueue = new MemberEventQueue();
const memberEventCallStack = new MemberEventCallStack();
const raisedEventLogging = new RaisedEventLogging();
export class ClassMember extends Member {
   /**
    * @param {String} name
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} classMemberInfoId
    */
   constructor(containerRefId, classMemberInfoId) {
      const memberEvent = new MemberEvent(
         classMemberInfoId,
         memberEventQueue.Id,
         containerRefId,
         memberEventCallStack.Id,
         raisedEventLogging.Id
      );
      const memberEventSubscription = new MemberEventSubscription(
         memberEvent.Id,
         memberEventQueue.Id
      );
      const memberEventPublisher = new MemberEventPublisher(
         memberEvent.Id,
         memberEventQueue.Id
      );
      super(containerRefId, classMemberInfoId, memberEventSubscription.Id, memberEventPublisher.Id);
   }
}
