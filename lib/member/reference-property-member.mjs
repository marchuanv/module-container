import { Container } from "../container.mjs";
import { MemberEventPublisher } from "../member-event-publisher.mjs";
import { MemberEventSubscription } from "../member-event-subscription.mjs";
import { MemberEvent } from "../member-event.mjs";
import { ReferencePropertyMemberInfo } from "../member-info/reference-property-member-info.mjs";
import { RaisedEventSubscription } from "../raised-event-subscription.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class ReferencePropertyMember extends Reference {
   /**
     * @param {ReferenceId} containerRefId
     * @param {ReferenceId} classMemberId
     * @param {ReferenceId} referencePropertyMemberInfoId
     * @param {ReferenceId} memberEventStackRefId
     * @param {ReferenceId} memberEventCallStackId
     * @param {ReferenceId} raisedEventLoggingId
     * @param {ReferenceId} raisedEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventSubscriptionStackRefId
     */
   constructor(
      containerRefId,
      classMemberId,
      referencePropertyMemberInfoId,
      memberEventStackRefId,
      memberEventCallStackId,
      raisedEventLoggingId,
      raisedEventSubscriptionStackRefId,
      memberEventSubscriptionStackRefId
   ) {
      if (new.target !== ReferencePropertyMember) {
         throw new Error(`can't inherit from ${ReferencePropertyMember.name}`);
      }
      super(referencePropertyMemberInfoId.name);
      this.dependency = containerRefId;
      this.dependency = classMemberId;
      const memberEvent = new MemberEvent(
         referencePropertyMemberInfoId,
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
         memberEventSubscriptionStackRefId
      );
      const memberEventPublisher = new MemberEventPublisher(
         memberEvent.Id,
         memberEventStackRefId,
         raisedEventSubscription.Id
      );
      const publishMemberEvent = async (data) => {
         return await memberEventPublisher.publish({ data });
      }
      const container = this.get(Container.prototype);
      Object.defineProperty(container, this.name, { configurable: false, get: publishMemberEvent, set: publishMemberEvent });
      const referencePropertyMemberInfo = this.get(ReferencePropertyMemberInfo.prototype);
      memberEventSubscription.subscribe(async () => {
         let instance = container.get(referencePropertyMemberInfo.Class.prototype);
         if (!instance) {
            throw new Error(`container does not have a ${referencePropertyMemberInfo.Class} object.`);
         }
         return instance;
      });
   }
}
