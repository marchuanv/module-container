import { MemberEventCallStack } from "../member-event-callstack.mjs";
import { MemberEventSubscriber } from "../member-event-subscriber.mjs";
import { MemberEvent } from "../member-event.mjs";
import { MemberInfo } from "../member-info.mjs";
import { RaisedEventLogging } from "../raised-event-logging.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventReference extends Reference {
   /**
    * @param {String} name 
    */
   constructor(name) {
      super(name, this, MemberEvent);
   }
   /**
    * @returns { MemberInfo }
    */
   get memberInfo() {
      return super.dependencies(MemberInfo);
   }
   /**
    * @returns { MemberEventCallStack }
    */
   get memberEventCallStack() {
      return super.dependencies(MemberEventCallStack);
   }
   /**
    * @returns { MemberEventSubscriber }
    */
   get memberEventSubscriber() {
      return super.dependencies(MemberEventSubscriber);
   }
   /**
    * @returns { RaisedEventLogging }
    */
   get raisedEventlogging() {
      return super.dependencies(RaisedEventLogging);
   }
}