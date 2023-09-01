import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
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
      const otherClassMemberInfoRef = methodMemberInfo.getAllReferences(ClassMemberInfo.prototype).find(x => x.Id !== thisClassMemberInfo.Id); //one to one relationship
      memberEventSubscription.subscribe(async (memberEvent) => {
         const memberFunction = methodMemberInfo.functions[0];
         return await memberFunction(input);
      });
   }
   async method(args) {
      const memberEventPublisher = super.getReference(MemberEventPublisher.prototype);
      const raisedEvent = await memberEventPublisher.publish(args);
   }
}
