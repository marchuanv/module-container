import { MemberEventPublisher } from "../member-event-publisher.mjs";
import { MemberEventSubscription } from "../member-event-subscription.mjs";
import { MemberEvent } from "../member-event.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { Member } from "./member.mjs";
export class MethodMember extends Member {
   /**
    * @param {String} name
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} methodMemberInfoId
    * @param {ReferenceId} memberEventQueueId
    * @param {ReferenceId} memberEventCallStackId
    * @param {ReferenceId} raisedEventLoggingId
    */
   constructor(containerRefId, methodMemberInfoId, memberEventQueueId, memberEventCallStackId, raisedEventLoggingId) {
      const memberEvent = new MemberEvent(
         methodMemberInfoId,
         memberEventQueueId,
         containerRefId,
         memberEventCallStackId,
         raisedEventLoggingId
      );
      const memberEventSubscription = new MemberEventSubscription(
         memberEvent.Id,
         memberEventQueueId
      );
      const memberEventPublisher = new MemberEventPublisher(
         memberEvent.Id,
         memberEventQueueId
      );
      super(containerRefId, methodMemberInfoId, memberEventSubscription.Id, memberEventPublisher.Id);
   }
}
