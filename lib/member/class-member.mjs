import { Container } from "../container.mjs";
import { EventManager } from "../event/event-manager.mjs";
import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { ReferencePropertyMemberInfo } from "../member-info/reference-property-member-info.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { MethodMember } from "../member/method-member.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberEventCallStack } from "../stack/member-event-callstack.mjs";
import { ReferencePropertyMember } from "./reference-property-member.mjs";
import { StaticPropertyMember } from "./static-property-member.mjs";
const memberEventCallStack = new MemberEventCallStack();
export class ClassMember extends Reference {
   /**
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} classMemberInfoRefId
    * @param {ReferenceId} eventManagerRefId
    */
   constructor(containerRefId, classMemberInfoRefId, eventManagerRefId) {
      if (new.target !== ClassMember) {
         throw new Error(`can't inherit from ${ClassMember.name}`);
      }
      super(classMemberInfoRefId.name);
      super.addReference(containerRefId, Container.prototype);
      super.addReference(classMemberInfoRefId, ClassMemberInfo.prototype);
      super.addReference(eventManagerRefId, EventManager.prototype);
      this.createReferenceProperties();
      this.createStaticProperties();
      this.createMethods();
   }
   createReferenceProperties() {
      const container = super.getReference(Container.prototype);
      const classMemberInfo = super.getReference(ClassMemberInfo.prototype);
      const eventManager = super.getReference(EventManager.prototype);
      for (const referencePropertyMemberInfo of classMemberInfo.getAllReferences(ReferencePropertyMemberInfo.prototype)) {
         const propertyMember = new ReferencePropertyMember(
            container.Id,
            this.Id,
            referencePropertyMemberInfo.Id,
            eventManager.Id
         );
         super.addReference(propertyMember.Id, ReferencePropertyMember.prototype);
      }
   }
   createStaticProperties() {
      const container = super.getReference(Container.prototype);
      const classMemberInfo = super.getReference(ClassMemberInfo.prototype);
      const eventManager = super.getReference(EventManager.prototype);
      for (const staticPropertyMemberInfo of classMemberInfo.getAllReferences(StaticPropertyMemberInfo.prototype)) {
         const propertyMember = new StaticPropertyMember(
            container.Id,
            this.Id,
            staticPropertyMemberInfo.Id,
            eventManager.Id
         );
         super.addReference(propertyMember.Id, StaticPropertyMember.prototype);
      }
   }
   createMethods() {
      const container = super.getReference(Container.prototype);
      const classMemberInfo = super.getReference(ClassMemberInfo.prototype);
      const eventManager = super.getReference(EventManager.prototype);
      for (const methodMemberInfo of classMemberInfo.getAllReferences(MethodMemberInfo.prototype)) {
         const methodMember = new MethodMember(
            container.Id,
            this.Id,
            methodMemberInfo.Id,
            eventManager.Id
         );
         super.addReference(methodMember.Id, MethodMember.prototype);
      }
   }
}
