import { Container } from "../container.mjs";
import { EventManager } from "../event-manager.mjs";
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
     * @param {ReferenceId} classMemberRefId
     * @param {ReferenceId} referencePropertyMemberInfoRefId
     * @param {ReferenceId} eventManagerRefId
     */
   constructor(
      containerRefId,
      classMemberRefId,
      referencePropertyMemberInfoRefId,
      eventManagerRefId
   ) {
      if (new.target !== ReferencePropertyMember) {
         throw new Error(`can't inherit from ${ReferencePropertyMember.name}`);
      }
      super(referencePropertyMemberInfoId.name);
      this.dependency = containerRefId;
      this.dependency = classMemberRefId;
      this.dependency = referencePropertyMemberInfoRefId;
      this.dependency = eventManagerRefId;
      const eventManager = this.get(EventManager.prototype);
      const memberEvent = new MemberEvent(
         referencePropertyMemberInfoRefId
      );
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
