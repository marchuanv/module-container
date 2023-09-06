import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { ClassMember } from "./class-member.mjs";
import { Member } from "./member.mjs";
export class MethodMember extends Member {
   /**
    * @param {ReferenceId} methodMemberInfoId
    */
   constructor(methodMemberInfoId) {
      if (new.target !== MethodMember) {
         throw new Error(`can't inherit from ${MethodMember.name}`);
      }
      super(methodMemberInfoId, MethodMemberInfo.prototype, MethodMember.prototype);
      const methodMemberInfo = super.getReference(MethodMemberInfo.prototype);
      const memberEventSubscription = super.getReference(MemberEventSubscription.prototype);
      const thisClassMemberInfo = methodMemberInfo.getReference(ClassMemberInfo.prototype);
      const thisClassMember = thisClassMemberInfo.getReference(ClassMember.prototype);
      memberEventSubscription.subscribe(async (memberEvent) => {
         if (!memberEvent.error) {
            const memberFunction = methodMemberInfo.functions[0];
            memberEvent.output = await memberFunction.call(thisClassMember, memberEvent.input);
         }
      });
   }
   async method(args) {
      const memberEventPublisher = super.getReference(MemberEventPublisher.prototype);
      const raisedEvent = await memberEventPublisher.publish(args);
      if (raisedEvent.error) {
         throw raisedEvent.error;
      }
      return raisedEvent.output;
   }
}