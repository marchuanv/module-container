import { Container } from "../container.mjs";
import { MemberEventPublisher } from "../member-event-publisher.mjs";
import { MemberEventSubscription } from "../member-event-subscription.mjs";
import { MemberEvent } from "../member-event.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class StaticPropertyMember extends Reference {
   /**
     * @param {ReferenceId} containerRefId
     * @param {ReferenceId} classMemberId
     * @param {ReferenceId} methodMemberInfoId
     * @param {ReferenceId} memberEventQueueId
     * @param {ReferenceId} memberEventCallStackId
     * @param {ReferenceId} raisedEventLoggingId
     */
   constructor(containerRefId, classMemberId, staticPropertyMemberInfoId, memberEventQueueId, memberEventCallStackId, raisedEventLoggingId) {
      if (new.target !== StaticPropertyMember) {
         throw new Error(`can't inherit from ${StaticPropertyMember.name}`);
      }
      super(staticPropertyMemberInfoId.name);
      this.dependency = containerRefId;
      this.dependency = classMemberId;
      const memberEvent = new MemberEvent(
         staticPropertyMemberInfoId,
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
      const publishMemberEvent = async (data) => {
         return await memberEventPublisher.publish({ data });
      }
      const container = this.get(Container.prototype);
      Object.defineProperty(container, this.name, { configurable: false, get: publishMemberEvent, set: publishMemberEvent });
      const staticPropertyMemberInfo = this.get(StaticPropertyMemberInfo.prototype);
      memberEventSubscription.subscribe(async () => {
         return staticPropertyMemberInfo.value;
      });
   }
}
