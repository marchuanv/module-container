import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { Member } from "./member.mjs";
export class StaticPropertyMember extends Member {
   /**
     * @param {ReferenceId} staticPropertyMemberInfoId
     * @param {ReferenceId} raisedEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventStackRefId
     */
   constructor(staticPropertyMemberInfoId) {
      if (new.target !== StaticPropertyMember) {
         throw new Error(`can't inherit from ${StaticPropertyMember.name}`);
      }
      super(staticPropertyMemberInfoId);
      const staticPropertyMemberInfo = super.getReference(StaticPropertyMemberInfo.prototype);
      const memberEventSubscription = super.getReference(MemberEventSubscription.prototype);
      memberEventSubscription.subscribe(async () => {
         return staticPropertyMemberInfo.value;
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
