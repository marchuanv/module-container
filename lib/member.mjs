import { Container } from "./container.mjs";
import { MemberEventPublisher } from "./member-event-publisher.mjs";
import { MemberEventSubscription } from "./member-event-subscription.mjs";
import { MemberInfo } from "./member-info.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class Member extends Reference {
   /**
    * @param { ReferenceId } containerRefId
    * @param { ReferenceId } memberInfoRefId
    * @param { ReferenceId } memberEventSubsriberRefId
    * @param { ReferenceId } memberEventPublisherRefId
    */
   constructor(containerRefId, memberInfoRefId, memberEventSubsriberRefId, memberEventPublisherRefId) {
      super(`${memberInfoRefId.name}_member`);
      this.dependency = containerRefId;
      this.dependency = memberInfoRefId;
      this.dependency = memberEventSubsriberRefId;
      this.dependency = memberEventPublisherRefId;
      const memberEventSubscription = this.get(MemberEventSubscription.prototype);
      const memberInfo = this.get(MemberInfo.prototype);
      const memberEventPublisher = this.get(MemberEventPublisher.prototype);
      const container = this.get(Container.prototype);
      if (!container.interface) {
         if (memberInfo.isProperty) {
            memberEventSubscription.subscribe(async () => {
               const instance = null;
               const classMemberInfo = memberInfo.get([MemberInfo.prototype]).find(mdi => mdi.isClass);
               if (classMemberInfo) {
                  instance = this.get(classMemberInfo.Class.prototype);
                  if (!instance) {
                     instance = new classMemberInfo.Class(classMemberInfo.args);
                  }
               } else if (memberInfo.isStatic) {
                  instance = memberInfo.staticValue;
               }
               return instance;
            });
         }
         if (memberInfo.isFunction) {
            memberEventSubscription.subscribe(async (data) => {
               for (const memberFunction of memberInfo.func) {
                  return await memberFunction(data);
               }
            });
         }
      }
      const publishEvent = async (data) => {
         return await memberEventPublisher.publish({ data });
      }
      if (memberInfo.isProperty) {
         Object.defineProperty(container, memberInfo.name, { configurable: false, get: publishEvent, set: publishEvent });
      }
      if (memberInfo.isFunction) {
         Object.defineProperty(container, memberInfo.name, { configurable: false, value: publishEvent });
      }
   }
}