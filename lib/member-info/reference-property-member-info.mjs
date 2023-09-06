import { ContainerConfigNode } from "../container-config-node.mjs";
import { ClassMemberInfo } from "./class-member-info.mjs";
import { MemberInfo } from "./member-info.mjs";
export class ReferencePropertyMemberInfo extends MemberInfo {
   /**
    * @param {ReferenceId} classMemberInfoId
    * @param {ContainerConfigNode} referencePropertyConfigNode
    */
   constructor(classMemberInfoId, referencePropertyConfigNode) {
      if (new.target !== ReferencePropertyMemberInfo) {
         throw new Error(`can't inherit from ${ReferencePropertyMemberInfo.name}`);
      }
      const referencePropertyConfig = referencePropertyConfigNode.find([], referencePropertyConfigNode.key);
      const { args, isPublic } = referencePropertyConfig;
      super(referencePropertyConfigNode.key, referencePropertyConfig.class, args, isPublic, null, false, true, false);
      super.addReference(classMemberInfoId, ClassMemberInfo.prototype);
   }
}
