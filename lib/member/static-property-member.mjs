import { Container } from "../container.mjs";
import { EventManager } from "../event/event-manager.mjs";
import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { MemberEvent } from "../event/member-event.mjs";
import { RaisedEventSubscription } from "../event/raised-event-subscription.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class StaticPropertyMember extends Reference {
   /**
     * @param {ReferenceId} containerRefId
     * @param {ReferenceId} classMemberId
     * @param {ReferenceId} staticPropertyMemberInfoId
     * @param {ReferenceId} eventManagerRefId
     */
   constructor(
      containerRefId,
      classMemberId,
      staticPropertyMemberInfoId,
      eventManagerRefId
   ) {
      if (new.target !== StaticPropertyMember) {
         throw new Error(`can't inherit from ${StaticPropertyMember.name}`);
      }
      super(staticPropertyMemberInfoId.name);
      this.dependency = containerRefId;
      this.dependency = classMemberId;
      this.dependency = staticPropertyMemberInfoId;
      this.dependency = eventManagerRefId;
      const eventManager = this.get(EventManager.prototype);
      const memberEvent = new MemberEvent(containerRefId);
      const raisedEventSubscription = new RaisedEventSubscription(
         memberEvent.Id,
         eventManager.raisedEventSubscriptionStackReferenceId
      );
      const memberEventSubscription = new MemberEventSubscription(
         memberEvent.Id,
         eventManager.memberEventSubscriptionStackReferenceId
      );
      const memberEventPublisher = new MemberEventPublisher(
         memberEvent.Id,
         eventManager.memberEventStackReferenceId,
         raisedEventSubscription.Id
      );
      const publishMemberEvent = async (data) => {
         return await memberEventPublisher.publish(data);
      }
      const container = this.get(Container.prototype);
      Object.defineProperty(container, this.name, { configurable: false, get: publishMemberEvent, set: publishMemberEvent });
      const staticPropertyMemberInfo = this.get(StaticPropertyMemberInfo.prototype);
      memberEventSubscription.subscribe(async () => {
         return staticPropertyMemberInfo.value;
      });
   }
}
