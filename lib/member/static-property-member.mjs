import { Container } from "../container.mjs";
import { MemberEventPublisher } from "../member-event-publisher.mjs";
import { MemberEventSubscription } from "../member-event-subscription.mjs";
import { MemberEvent } from "../member-event.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { RaisedEventSubscription } from "../raised-event-subscription.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class StaticPropertyMember extends Reference {
   /**
     * @param {ReferenceId} containerRefId
     * @param {ReferenceId} classMemberId
     * @param {ReferenceId} staticPropertyMemberInfoId
     * @param {ReferenceId} memberEventStackRefId
     * @param {ReferenceId} memberEventCallStackId
     * @param {ReferenceId} raisedEventLoggingId,
     * @param {ReferenceId} raisedEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventSubscriptionStackRefId
     */
   constructor(
      containerRefId,
      classMemberId,
      staticPropertyMemberInfoId,
      memberEventStackRefId,
      memberEventCallStackId,
      raisedEventLoggingId
   ) {
      if (new.target !== StaticPropertyMember) {
         throw new Error(`can't inherit from ${StaticPropertyMember.name}`);
      }
      super(staticPropertyMemberInfoId.name);
      this.dependency = containerRefId;
      this.dependency = classMemberId;
      const memberEvent = new MemberEvent(
         staticPropertyMemberInfoId,
         memberEventStackRefId,
         containerRefId,
         memberEventCallStackId,
         raisedEventLoggingId
      );
      const raisedEventSubscription = new RaisedEventSubscription(
         memberEvent.Id,
         raisedEventSubscriptionStackRefId
      );
      const memberEventSubscription = new MemberEventSubscription(
         memberEvent.Id,
         memberEventStackRefId
      );
      const memberEventPublisher = new MemberEventPublisher(
         memberEvent.Id,
         memberEventStackRefId
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
