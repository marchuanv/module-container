import { Container } from "../container.mjs";
import { MemberEventPublisher } from "../member-event-publisher.mjs";
import { MemberEventSubscription } from "../member-event-subscription.mjs";
import { MemberEvent } from "../member-event.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { RaisedEventSubscription } from "../raised-event-subscription.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class MethodMember extends Reference {
   /**
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} classMemberId
    * @param {ReferenceId} methodMemberInfoId
    * @param {ReferenceId} memberEventStackRefId
    * @param {ReferenceId} memberEventCallStackId
    * @param {ReferenceId} raisedEventLoggingId
    * @param {ReferenceId} raisedEventSubscriptionStackRefId
    * @param {ReferenceId} memberEventSubscriptionStackRefId
    */
   constructor(
      containerRefId,
      classMemberId,
      methodMemberInfoId,
      memberEventStackRefId,
      memberEventCallStackId,
      raisedEventLoggingId,
      raisedEventSubscriptionStackRefId,
      memberEventSubscriptionStackRefId
   ) {
      if (new.target !== MethodMember) {
         throw new Error(`can't inherit from ${MethodMember.name}`);
      }
      super(methodMemberInfoId.name);
      this.dependency = containerRefId;
      this.dependency = classMemberId;
      const memberEvent = new MemberEvent(
         methodMemberInfoId,
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
      const container = super.get(Container.prototype);
      Object.defineProperty(container, super.name, { configurable: false, value: publishMemberEvent });
      const methodMemberInfo = super.get(MethodMemberInfo.prototype);
      memberEventSubscription.subscribe(async (input) => {
         const memberFunction = methodMemberInfo.functions[0];
         return await memberFunction(input);
      });
   }
}
