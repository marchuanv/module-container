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
     */
   constructor(referencePropertyMemberInfoRefId) {
      if (new.target !== ReferencePropertyMember) {
         throw new Error(`can't inherit from ${ReferencePropertyMember.name}`);
      }
      super(referencePropertyMemberInfoRefId, ReferencePropertyMemberInfo.prototype, ReferencePropertyMember.prototype);
      const referencePropertyMemberInfo = super.getReference(ReferencePropertyMemberInfo.prototype);
      const thisClassMemberInfo = referencePropertyMemberInfo.getReference(ClassMemberInfo.prototype);
      const memberEventSubscription = super.getReference(MemberEventSubscription.prototype);
      memberEventSubscription.subscribe(async (memberEvent) => {
         const otherClassMemberInfoRef = referencePropertyMemberInfo.getAllReferences(ClassMemberInfo.prototype).find(x => x.Id !== thisClassMemberInfo.Id); //one to one relationship
         memberEvent.data = otherClassMemberInfoRef.getReference(ClassMember.prototype);
      });
   }
   get() {
      return new Promise(async (resovle, reject) => {
         try {
            const memberEventPublisher = super.getReference(MemberEventPublisher.prototype);
            const raisedEvent = await memberEventPublisher.publish();
            resovle(raisedEvent.data);
         } catch (error) {
            reject(error);
         }
      });
   }
   set(data) {
      return new Promise(async (resovle, reject) => {
         try {
            const memberEventPublisher = super.getReference(MemberEventPublisher.prototype);
            const raisedEvent = await memberEventPublisher.publish(data);
            resovle(raisedEvent.data);
         } catch (error) {
            reject(error);
         }
      });
   }
}
