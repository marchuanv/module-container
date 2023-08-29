import { MemberEventPublisher } from "./member-event-publisher.mjs";
import { MemberEventSubscription } from "./member-event-subscription.mjs";
import { MemberEvent } from "./member-event.mjs";
import { Member } from "./member.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class PropertyMember extends Member {
   /**
     * @param {String} name
     * @param {ReferenceId} containerRefId
     * @param {ReferenceId} methodMemberInfoId
     * @param {ReferenceId} memberEventQueueId
     * @param {ReferenceId} memberEventCallStackId
     * @param {ReferenceId} raisedEventLoggingId
     */
   constructor(containerRefId, propertyMemberInfoId, memberEventQueueId, memberEventCallStackId, raisedEventLoggingId) {
      const memberEvent = new MemberEvent(
         propertyMemberInfoId,
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
      super(containerRefId, propertyMemberInfoId, memberEventSubscription.Id, memberEventPublisher.Id);
   }
}
