import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { MemberEvent } from "../event/member-event.mjs";
import { RaisedEventSubscription } from "../event/raised-event-subscription.mjs";
import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class MethodMember extends Reference {
   /**
    * @param {ReferenceId} methodMemberInfoId
    * @param {ReferenceId} raisedEventSubscriptionStackRefId
    * @param {ReferenceId} memberEventSubscriptionStackRefId
    * @param {ReferenceId} memberEventStackRefId
    */
   constructor(
      methodMemberInfoId,
      raisedEventSubscriptionStackRefId,
      memberEventSubscriptionStackRefId,
      memberEventStackRefId,
   ) {
      if (new.target !== MethodMember) {
         throw new Error(`can't inherit from ${MethodMember.name}`);
      }
      super(methodMemberInfoId.name);
      super.addReference(methodMemberInfoId, MethodMemberInfo.prototype);
      const memberEvent = new MemberEvent(methodMemberInfoId);
      const raisedEventSubscription = new RaisedEventSubscription(memberEvent.Id, raisedEventSubscriptionStackRefId);
      const memberEventPublisher = new MemberEventPublisher(memberEvent.Id, memberEventStackRefId, raisedEventSubscription.Id);
      super.addReference(memberEventPublisher.Id, MemberEventPublisher.prototype);
      const methodMemberInfo = super.getReference(MethodMemberInfo.prototype);
      const otherClassMemberInfoRef = methodMemberInfo.getReference(ClassMemberInfo.prototype); //one to one relationship
      const memberEventSubscription = new MemberEventSubscription(memberEvent.Id, memberEventSubscriptionStackRefId);
      memberEventSubscription.subscribe(async (input) => {
         const memberFunction = methodMemberInfo.functions[0];
         return await memberFunction(input);
      });
   }
   async method(args) {
      const memberEventPublisher = super.getReference(MemberEventPublisher.prototype);
      return await memberEventPublisher.publish(args);
   }
}
