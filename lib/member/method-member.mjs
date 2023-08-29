import { Container } from "../container.mjs";
import { MemberEventPublisher } from "../member-event-publisher.mjs";
import { MemberEventSubscription } from "../member-event-subscription.mjs";
import { MemberEvent } from "../member-event.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class MethodMember extends Reference {
   /**
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} classMemberId
    * @param {ReferenceId} methodMemberInfoId
    * @param {ReferenceId} memberEventQueueId
    * @param {ReferenceId} memberEventCallStackId
    * @param {ReferenceId} raisedEventLoggingId
    */
   constructor(containerRefId, classMemberId, methodMemberInfoId, memberEventQueueId, memberEventCallStackId, raisedEventLoggingId) {
      if (new.target !== MethodMember) {
         throw new Error(`can't inherit from ${MethodMember.name}`);
      }
      super(methodMemberInfoId.name);
      this.dependency = containerRefId;
      this.dependency = classMemberId;
      const memberEvent = new MemberEvent(
         methodMemberInfoId,
         memberEventQueueId,
         containerRefId,
         memberEventCallStackId,
         raisedEventLoggingId
      );
      const memberEventSubscription = new MemberEventSubscription(
         memberEvent.Id,
         memberEventQueueId
      );
      const memberEventPublisher = new MemberEventPublisher(
         memberEvent.Id,
         memberEventQueueId
      );
      const publishMemberEvent = async (data) => {
         return await memberEventPublisher.publish({ data });
      }
      const container = this.get(Container.prototype);
      Object.defineProperty(container, this.name, { configurable: false, value: publishMemberEvent });
      const methodMemberInfo = this.get(MethodMemberInfo.prototype);
      memberEventSubscription.subscribe(async (data) => {
         const memberFunction = methodMemberInfo.functions[0];
         return await memberFunction(data);
      });
   }
}
