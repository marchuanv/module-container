import { MemberEventSubscription } from "../event/member-event-subscription.mjs";
import { MemberEvent } from "../event/member-event.mjs";
import { RaisedEventSubscription } from "../event/raised-event-subscription.mjs";
import { MemberInfo } from "../member-info/member-info.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberEventStack } from "../stack/member-event-stack.mjs";
import { MemberEventSubscriptionStack } from "../stack/member-event-subscription-stack.mjs";
import { RaisedEventSubscriptionStack } from "../stack/raised-event-subscription-stack.mjs";
const memberEventStack = new MemberEventStack();
const memberEventSubscriptionStack = new MemberEventSubscriptionStack();
const raisedEventSubscriptionStack = new RaisedEventSubscriptionStack();
export class Member extends Reference {
   /**
    * @param {ReferenceId} memberInfoRefId
    */
   constructor(memberInfoRefId) {
      if (new.target === Member) {
         throw new Error(`can only inherit from ${Member.name}`);
      }
      super(memberInfoRefId.name);
      super.addReference(memberInfoRefId, MemberInfo.prototype);
      const memberInfo = super.getReference(MemberInfo.prototype);
      memberInfo.addReference(this.Id, Member);
      const raisedEventSubscription = new RaisedEventSubscription(memberEvent.Id, raisedEventSubscriptionStack.Id);
      const memberEventSubscription = new MemberEventSubscription(memberEvent.Id, memberEventSubscriptionStack.Id);
      super.addReference(memberEventSubscription.Id, MemberEventSubscription.prototype);
      const memberEventPublisher = new MemberEventPublisher(memberEvent.Id, memberEventStack.Id, raisedEventSubscription.Id);
      super.addReference(memberEventPublisher.Id, MemberEventPublisher.prototype);
      const memberEvent = new MemberEvent(memberInfoRefId);

   }
}
