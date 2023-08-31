import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { ReferencePropertyMemberInfo } from "../member-info/reference-property-member-info.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { MethodMember } from "../member/method-member.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { ReferencePropertyMember } from "./reference-property-member.mjs";
import { StaticPropertyMember } from "./static-property-member.mjs";
export class ClassMember extends Reference {
   /**
    * @param {ReferenceId} classMemberInfoRefId
    * @param {ReferenceId} raisedEventSubscriptionStackRefId
    * @param {ReferenceId} memberEventSubscriptionStackRefId
    * @param {ReferenceId} memberEventStackRefId
    */
   constructor(
      classMemberInfoRefId,
      raisedEventSubscriptionStackRefId,
      memberEventSubscriptionStackRefId,
      memberEventStackRefId
   ) {
      if (new.target !== ClassMember) {
         throw new Error(`can't inherit from ${ClassMember.name}`);
      }
      super(classMemberInfoRefId.name);
      super.addReference(classMemberInfoRefId, ClassMemberInfo.prototype);
      const classMemberInfo = super.getReference(ClassMemberInfo.prototype);
      for (const referencePropertyMemberInfo of classMemberInfo.getAllReferences(ReferencePropertyMemberInfo.prototype)) {
         const referencePropertyMember = new ReferencePropertyMember(
            referencePropertyMemberInfo.Id,
            raisedEventSubscriptionStackRefId,
            memberEventSubscriptionStackRefId,
            memberEventStackRefId
         );
         Object.defineProperty(this, referencePropertyMemberInfo.name, {
            configurable: false,
            get: referencePropertyMember.property,
            set: referencePropertyMember.property
         });
         super.addReference(referencePropertyMember.Id, ReferencePropertyMember.prototype);
      }
      for (const staticPropertyMemberInfo of classMemberInfo.getAllReferences(StaticPropertyMemberInfo.prototype)) {
         const propertyMember = new StaticPropertyMember(
            staticPropertyMemberInfo.Id,
            raisedEventSubscriptionStackRefId,
            memberEventSubscriptionStackRefId,
            memberEventStackRefId
         );
         Object.defineProperty(container, staticPropertyMemberInfo.name, {
            configurable: false,
            get: propertyMember.property,
            set: propertyMember.property
         });
         super.addReference(propertyMember.Id, StaticPropertyMember.prototype);
      }
      for (const methodMemberInfo of classMemberInfo.getAllReferences(MethodMemberInfo.prototype)) {
         const methodMember = new MethodMember(
            methodMemberInfo.Id,
            raisedEventSubscriptionStackRefId,
            memberEventSubscriptionStackRefId,
            memberEventStackRefId
         );
         Object.defineProperty(container, methodMemberInfo.name, {
            configurable: false,
            value: methodMember.method
         });
         super.addReference(methodMember.Id, MethodMember.prototype);
      }
   }
}
