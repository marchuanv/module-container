import { ClassMemberInfo } from "../member-info/class-member-info.mjs";
import { MethodMemberInfo } from "../member-info/method-member-info.mjs";
import { ReferencePropertyMemberInfo } from "../member-info/reference-property-member-info.mjs";
import { StaticPropertyMemberInfo } from "../member-info/static-property-member-info.mjs";
import { MethodMember } from "../member/method-member.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { Member } from "./member.mjs";
import { ReferencePropertyMember } from "./reference-property-member.mjs";
import { StaticPropertyMember } from "./static-property-member.mjs";
export class ClassMember extends Member {
   /**
    * @param {ReferenceId} classMemberInfoRefId
    * @param {ReferenceId} raisedEventSubscriptionStackRefId
    * @param {ReferenceId} memberEventSubscriptionStackRefId
    * @param {ReferenceId} memberEventStackRefId
    */
   constructor(classMemberInfoRefId) {
      if (new.target !== ClassMember) {
         throw new Error(`can't inherit from ${ClassMember.name}`);
      }
      super(classMemberInfoRefId, ClassMemberInfo.prototype, ClassMember.prototype);
      const classMemberInfo = super.getReference(ClassMemberInfo.prototype);
      classMemberInfo.addReference(this.Id, ClassMember.prototype);
      for (const referencePropertyMemberInfo of classMemberInfo.getAllReferences(ReferencePropertyMemberInfo.prototype)) {
         const referencePropertyMember = new ReferencePropertyMember(referencePropertyMemberInfo.Id);
         Object.defineProperty(this, referencePropertyMemberInfo.name, {
            configurable: false,
            get: async function () {
               return await referencePropertyMember.get();
            },
            set: async function (value) {
               return await referencePropertyMember.set(value);
            }
         });
         super.addReference(referencePropertyMember.Id, ReferencePropertyMember.prototype);
      }
      for (const staticPropertyMemberInfo of classMemberInfo.getAllReferences(StaticPropertyMemberInfo.prototype)) {
         const staticPropertyMember = new StaticPropertyMember(staticPropertyMemberInfo.Id);
         Object.defineProperty(this, staticPropertyMemberInfo.name, {
            configurable: false,
            get: async function () {
               return await staticPropertyMember.get();
            },
            set: async function (value) {
               return await staticPropertyMember.set(value);
            }
         });
         super.addReference(staticPropertyMember.Id, StaticPropertyMember.prototype);
      }
      for (const methodMemberInfo of classMemberInfo.getAllReferences(MethodMemberInfo.prototype)) {
         const methodMember = new MethodMember(methodMemberInfo.Id);
         Object.defineProperty(this, methodMemberInfo.name, {
            configurable: false,
            value: async function (args) {
               return await methodMember.method(args);
            }
         });
         super.addReference(methodMember.Id, MethodMember.prototype);
      }
      Object.defineProperty(this, 'constructor', {
         configurable: false,
         value: classMemberInfo.ctor
      });
   }
}
