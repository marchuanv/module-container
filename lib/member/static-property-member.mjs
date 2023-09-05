import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { Member } from "./member.mjs";
export class StaticPropertyMember extends Member {
   /**
     * @param {ReferenceId} staticPropertyMemberInfoId
     */
   constructor(staticPropertyMemberInfoId) {
      if (new.target !== StaticPropertyMember) {
         throw new Error(`can't inherit from ${StaticPropertyMember.name}`);
      }
      super(staticPropertyMemberInfoId, StaticPropertyMemberInfo.prototype, StaticPropertyMember.prototype);
      const staticPropertyMemberInfo = super.getReference(StaticPropertyMemberInfo.prototype);
      const memberEventSubscription = super.getReference(MemberEventSubscription.prototype);
      memberEventSubscription.subscribe(async (memberEvent) => {
         if (!memberEvent.error) {
            memberEvent.data = staticPropertyMemberInfo.value;
         }
      });
   }
   get() {
      return new Promise(async (resovle, reject) => {
         try {
            const memberEventPublisher = super.getReference(MemberEventPublisher.prototype);
            const raisedEvent = await memberEventPublisher.publish();
            if (raisedEvent.error) {
               throw raisedEvent.error;
            }
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
            if (raisedEvent.error) {
               throw raisedEvent.error;
            }
            resovle(raisedEvent.data);
         } catch (error) {
            reject(error);
         }
      });
   }
}
