import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { MemberEvent } from "../event/member-event.mjs";
import { RaisedEventSubscription } from "../event/raised-event-subscription.mjs";
import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { ReferencePropertyMemberInfo } from "../member-info/reference-property-member-info.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { ClassMember } from "./class-member.mjs";
export class ReferencePropertyMember extends Reference {
   /**
     * @param {ReferenceId} classMemberRefId
     * @param {ReferenceId} referencePropertyMemberInfoRefId
     * @param {ReferenceId} raisedEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventStackRefId
     */
   constructor(
      referencePropertyMemberInfoRefId,
      raisedEventSubscriptionStackRefId,
      memberEventSubscriptionStackRefId,
      memberEventStackRefId,
   ) {
      if (new.target !== ReferencePropertyMember) {
         throw new Error(`can't inherit from ${ReferencePropertyMember.name}`);
      }
      super(referencePropertyMemberInfoRefId.name);
      super.addReference(referencePropertyMemberInfoRefId, ReferencePropertyMemberInfo.prototype);
      const memberEvent = new MemberEvent(referencePropertyMemberInfoRefId);
      const raisedEventSubscription = new RaisedEventSubscription(memberEvent.Id, raisedEventSubscriptionStackRefId);
      const memberEventPublisher = new MemberEventPublisher(memberEvent.Id, memberEventStackRefId, raisedEventSubscription.Id);
      super.addReference(memberEventPublisher.Id, MemberEventPublisher.prototype);
      const referencePropertyMemberInfo = super.getReference(ReferencePropertyMemberInfo.prototype);
      const otherClassMemberInfoRef = referencePropertyMemberInfo.getReference(ClassMemberInfo.prototype); //one to one relationship
      const memberEventSubscription = new MemberEventSubscription(memberEvent.Id, memberEventSubscriptionStackRefId);
      memberEventSubscription.subscribe(async () => {
         return otherClassMemberInfoRef.getReference(ClassMember.prototype);
      });
   }
   get property() {
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
   set property(data) {
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
