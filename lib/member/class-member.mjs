import { Container } from "../container.mjs";
import { MemberEventCallStack } from "../member-event-callstack.mjs";
import { MemberEventStack } from "../member-event-stack.mjs";
import { MemberEventSubscriptionStack } from "../member-event-subscription-stack.mjs";
import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { ReferencePropertyMemberInfo } from "../member-info/reference-property-member-info.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { MethodMember } from "../member/method-member.mjs";
import { RaisedEventLogging } from "../raised-event-logging.mjs";
import { RaisedEventSubscriptionStack } from "../raised-event-subscription-stack.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { ReferencePropertyMember } from "./reference-property-member.mjs";
import { StaticPropertyMember } from "./static-property-member.mjs";
const memberEventStack = new MemberEventStack();
const memberEventCallStack = new MemberEventCallStack();
const memberEventSubscriptionStack = new MemberEventSubscriptionStack();
const raisedEventSubscriptionStack = new RaisedEventSubscriptionStack();
const raisedEventLogging = new RaisedEventLogging(raisedEventSubscriptionStack.Id);
export class ClassMember extends Reference {
   /**
    * @param {ReferenceId} containerReferenceId
    * @param {ReferenceId} classMemberInfoId
    */
   constructor(containerReferenceId, classMemberInfoId) {
      if (new.target !== ClassMember) {
         throw new Error(`can't inherit from ${ClassMember.name}`);
      }
      super(classMemberInfoId.name);
      this.dependency = containerReferenceId;
      this.dependency = classMemberInfoId;
      this.createReferenceProperties();
      this.createStaticProperties();
      this.createMethods();
   }
   createReferenceProperties() {
      const container = this.get(Container.prototype);
      const classMemberInfo = this.get(ClassMemberInfo.prototype);
      for (const referencePropertyMemberInfo of classMemberInfo.getDependencies(ReferencePropertyMemberInfo.prototype)) {
         const propertyMember = new ReferencePropertyMember(
            container.Id,
            this.Id,
            referencePropertyMemberInfo.Id,
            memberEventStack.Id,
            memberEventCallStack.Id,
            raisedEventLogging.Id
         );
         this.dependency = propertyMember.Id;
      }
   }
   createStaticProperties() {
      const container = this.get(Container.prototype);
      const classMemberInfo = this.get(ClassMemberInfo.prototype);
      for (const staticPropertyMemberInfo of classMemberInfo.getDependencies(StaticPropertyMemberInfo.prototype)) {
         const propertyMember = new StaticPropertyMember(
            container.Id,
            this.Id,
            staticPropertyMemberInfo.Id,
            memberEventStack.Id,
            memberEventCallStack.Id,
            raisedEventLogging.Id
         );
         this.dependency = propertyMember.Id;
      }
   }
   createMethods() {
      const container = this.get(Container.prototype);
      const classMemberInfo = this.get(ClassMemberInfo.prototype);
      for (const methodMemberInfo of classMemberInfo.getDependencies(MethodMemberInfo.prototype)) {
         const methodMember = new MethodMember(
            container.Id,
            this.Id,
            methodMemberInfo.Id,
            memberEventStack.Id,
            memberEventCallStack.Id,
            raisedEventLogging.Id
         );
         this.dependency = methodMember.Id;
      }
   }
}
