import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { MemberEvent } from "../event/member-event.mjs";
import { RaisedEventSubscription } from "../event/raised-event-subscription.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class StaticPropertyMember extends Reference {
   /**
     * @param {ReferenceId} staticPropertyMemberInfoId
     * @param {ReferenceId} raisedEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventSubscriptionStackRefId
     * @param {ReferenceId} memberEventStackRefId
     */
   constructor(
      staticPropertyMemberInfoId,
      raisedEventSubscriptionStackRefId,
      memberEventSubscriptionStackRefId,
      memberEventStackRefId,
   ) {
      if (new.target !== StaticPropertyMember) {
         throw new Error(`can't inherit from ${StaticPropertyMember.name}`);
      }
      super(staticPropertyMemberInfoId.name);
      super.addReference(staticPropertyMemberInfoId, ReferencePropertyMemberInfo.prototype);
      const memberEvent = new MemberEvent(staticPropertyMemberInfoId);
      const raisedEventSubscription = new RaisedEventSubscription(memberEvent.Id, raisedEventSubscriptionStackRefId);
      const memberEventPublisher = new MemberEventPublisher(memberEvent.Id, memberEventStackRefId, raisedEventSubscription.Id);
      super.addReference(memberEventPublisher.Id, MemberEventPublisher.prototype);
      const staticPropertyMemberInfo = super.getReference(StaticPropertyMemberInfo.prototype);
      const memberEventSubscription = new MemberEventSubscription(memberEvent.Id, memberEventSubscriptionStackRefId);
      memberEventSubscription.subscribe(async () => {
         return staticPropertyMemberInfo.value;
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
