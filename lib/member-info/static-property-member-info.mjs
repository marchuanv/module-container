import { ContainerConfigNode } from "../container-config-node.mjs";
import { Container } from "../container.mjs";
import { ClassMemberInfo } from "./class-member-info.mjs";
import { MemberInfo } from "./member-info.mjs";
export class StaticPropertyMemberInfo extends MemberInfo {
   /**
   * @param {ReferenceId} containerRefId
   * @param {ReferenceId} classMemberInfoId
   * @param {ContainerConfigNode} staticPropertyConfigNode
   */
   constructor(containerRefId, classMemberInfoId, staticPropertyConfigNode) {
      if (new.target !== StaticPropertyMemberInfo) {
         throw new Error(`can't inherit from ${StaticPropertyMemberInfo.name}`);
      }
      staticPropertyConfigNode.find([], staticPropertyConfigNode.key, (config) => {
         super(staticPropertyConfigNode.key, null, null, config.isPublic, config.value, false, true, false);
      });
      super.addReference(containerRefId, Container.prototype);
      super.addReference(classMemberInfoId, ClassMemberInfo.prototype);
   }
}
