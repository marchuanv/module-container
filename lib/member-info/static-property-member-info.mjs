import { ContainerConfigNode } from "../container-config-node.mjs";
import { ClassMemberInfo } from "./class-member-info.mjs";
import { MemberInfo } from "./member-info.mjs";
export class StaticPropertyMemberInfo extends MemberInfo {
   /**
   * @param {ReferenceId} classMemberInfoId
   * @param {ContainerConfigNode} staticPropertyConfigNode
   */
   constructor(classMemberInfoId, staticPropertyConfigNode) {
      if (new.target !== StaticPropertyMemberInfo) {
         throw new Error(`can't inherit from ${StaticPropertyMemberInfo.name}`);
      }
      const staticPropertyConfig = staticPropertyConfigNode.find([], staticPropertyConfigNode.key);
      const { isPublic, value } = staticPropertyConfig;
      super(staticPropertyConfigNode.key, null, null, isPublic, value, false, true, false);
      super.addReference(classMemberInfoId, ClassMemberInfo.prototype);
   }
}
