import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { ReferencePropertyMemberInfo } from "../member-info/reference-property-member-info.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { ClassMember } from "./class-member.mjs";
import { Member } from "./member.mjs";
export class ReferencePropertyMember extends Member {
   /**
     * @param {ReferenceId} referencePropertyMemberInfoRefId
     * @param {ReferenceId} raisedEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventStackRefId
     */
   constructor(referencePropertyMemberInfoRefId) {
      if (new.target !== ReferencePropertyMember) {
         throw new Error(`can't inherit from ${ReferencePropertyMember.name}`);
      }
      super(referencePropertyMemberInfoRefId);
      const referencePropertyMemberInfo = super.getReference(ReferencePropertyMemberInfo.prototype);
      const thisClassMemberInfo = referencePropertyMemberInfo.getReference(ClassMemberInfo.prototype);
      const otherClassMemberInfoRef = referencePropertyMemberInfo.getAllReferences(ClassMemberInfo.prototype).find(x => x.Id !== thisClassMemberInfo.Id); //one to one relationship
      const memberEventSubscription = super.getReference(MemberEventSubscription.prototype);
      memberEventSubscription.subscribe(async () => {
         return otherClassMemberInfoRef.getReference(ClassMember.prototype);
      });
   }
   get() {
      return new Promise(async (resovle, reject) => {
         try {
            const memberEventPublisher = super.getReference(MemberEventPublisher.prototype);
            const output = await memberEventPublisher.publish();
            resovle(output);
         } catch (error) {
            reject(error);
         }
      });
   }
   set(data) {
      return new Promise(async (resovle, reject) => {
         try {
            const memberEventPublisher = super.getReference(MemberEventPublisher.prototype);
            const output = await memberEventPublisher.publish(data);
            resovle(output);
         } catch (error) {
            reject(error);
         }
      });
   }
}
