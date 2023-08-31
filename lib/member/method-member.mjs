import { Container } from "../container.mjs";
import { EventManager } from "../event/event-manager.mjs";
import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { MemberEvent } from "../event/member-event.mjs";
import { RaisedEventSubscription } from "../event/raised-event-subscription.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class MethodMember extends Reference {
   /**
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} classMemberId
    * @param {ReferenceId} methodMemberInfoId
    * @param {ReferenceId} eventManagerRefId
    */
   constructor(
      containerRefId,
      classMemberId,
      methodMemberInfoId,
      eventManagerRefId
   ) {
      if (new.target !== MethodMember) {
         throw new Error(`can't inherit from ${MethodMember.name}`);
      }
      super(methodMemberInfoId.name);
      this.dependency = containerRefId;
      this.dependency = classMemberId;
      this.dependency = methodMemberInfoId;
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
      const container = super.get(Container.prototype);
      Object.defineProperty(container, super.name, { configurable: false, value: publishMemberEvent });
      const methodMemberInfo = super.get(MethodMemberInfo.prototype);
      memberEventSubscription.subscribe(async (input) => {
         const memberFunction = methodMemberInfo.functions[0];
         return await memberFunction(input);
      });
   }
}
