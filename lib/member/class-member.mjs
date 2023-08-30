import { Container } from "../container.mjs";
import { EventManager } from "../event-manager.mjs";
import { MemberEventCallStack } from "../member-event-callstack.mjs";
import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { ReferencePropertyMemberInfo } from "../member-info/reference-property-member-info.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { MethodMember } from "../member/method-member.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { ReferencePropertyMember } from "./reference-property-member.mjs";
import { StaticPropertyMember } from "./static-property-member.mjs";
const memberEventCallStack = new MemberEventCallStack();
export class ClassMember extends Reference {
   /**
    * @param {ReferenceId} containerReferenceId
    * @param {ReferenceId} classMemberInfoId
    * @param {ReferenceId} eventManagerRefId
    */
   constructor(containerReferenceId, classMemberInfoId, eventManagerRefId) {
      if (new.target !== ClassMember) {
         throw new Error(`can't inherit from ${ClassMember.name}`);
      }
      super(classMemberInfoId.name);
      this.dependency = containerReferenceId;
      this.dependency = classMemberInfoId;
      this.dependency = eventManagerRefId;
      this.createReferenceProperties();
      this.createStaticProperties();
      this.createMethods();
   }
   createReferenceProperties() {
      const container = this.get(Container.prototype);
      const classMemberInfo = this.get(ClassMemberInfo.prototype);
      const eventManager = this.get(EventManager.prototype);
      for (const referencePropertyMemberInfo of classMemberInfo.getDependencies(ReferencePropertyMemberInfo.prototype)) {
         const propertyMember = new ReferencePropertyMember(
            container.Id,
            this.Id,
            referencePropertyMemberInfo.Id,
            eventManager.Id
         );
         this.dependency = propertyMember.Id;
      }
   }
   createStaticProperties() {
      const container = this.get(Container.prototype);
      const classMemberInfo = this.get(ClassMemberInfo.prototype);
      const eventManager = this.get(EventManager.prototype);
      for (const staticPropertyMemberInfo of classMemberInfo.getDependencies(StaticPropertyMemberInfo.prototype)) {
         const propertyMember = new StaticPropertyMember(
            container.Id,
            this.Id,
            staticPropertyMemberInfo.Id,
            eventManager.Id
         );
         this.dependency = propertyMember.Id;
      }
   }
   createMethods() {
      const container = this.get(Container.prototype);
      const classMemberInfo = this.get(ClassMemberInfo.prototype);
      const eventManager = this.get(EventManager.prototype);
      for (const methodMemberInfo of classMemberInfo.getDependencies(MethodMemberInfo.prototype)) {
         const methodMember = new MethodMember(
            container.Id,
            this.Id,
            methodMemberInfo.Id,
            eventManager.Id
         );
         this.dependency = methodMember.Id;
      }
   }
}
