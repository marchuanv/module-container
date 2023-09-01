import { MemberEventPublisher } from "../event/member-event-publisher.mjs";
import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { MemberEvent } from "../event/member-event.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class Member extends Reference {
   /**
    * @template T1
    * @template T2
    * @param {ReferenceId} memberInfoRefId
    * @param { T1 } memberInfoPrototype
    * @param { T2 } memberPrototype
    */
   constructor(memberInfoRefId, memberInfoPrototype, memberPrototype) {
      if (new.target === Member) {
         throw new Error(`can only inherit from ${Member.name}`);
      }
      super(memberInfoRefId.name);
      super.addReference(memberInfoRefId, memberInfoPrototype);
      const memberInfo = super.getReference(memberInfoPrototype);
      memberInfo.addReference(this.Id, memberPrototype);
      const memberEvent = new MemberEvent(super.Id);
      const memberEventSubscription = new MemberEventSubscription(memberEvent.Id);
      super.addReference(memberEventSubscription.Id, MemberEventSubscription.prototype);
      const memberEventPublisher = new MemberEventPublisher(memberEvent.Id);
      super.addReference(memberEventPublisher.Id, MemberEventPublisher.prototype);
   }
}
