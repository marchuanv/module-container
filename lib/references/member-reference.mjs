import { Container } from "../container.mjs";
import { MemberEventPublisher } from "../member-event-publisher.mjs";
import { MemberEventSubscriber } from "../member-event-subscriber.mjs";
import { MemberInfo } from "../member-info.mjs";
import { Member } from "../member.mjs";
import { Reference } from "./reference.mjs";
export class MemberReference extends Reference {
   /**
   * @param {String} name
   */
   constructor(name) {
      super(name, this, Member);
   }
   /**
    * @returns { Container }
    */
   get container() {
      return super.dependencies(Container);
   }
   /**
    * @returns { MemberInfo }
    */
   get memberInfo() {
      return super.dependencies(MemberInfo);
   }
   /**
    * @returns { MemberEventSubscriber }
    */
   get memberEventSubscriber() {
      return super.dependencies(MemberEventSubscriber);
   }
   /**
    * @returns { MemberEventPublisher }
    */
   get memberEventPublisher() {
      return super.dependencies(MemberEventPublisher);
   }
}