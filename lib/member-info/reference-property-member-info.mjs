import { ContainerConfigNode } from "../container-config-node.mjs";
import { Container } from "../container.mjs";
import { ClassMemberInfo } from "./class-member-info.mjs";
import { MemberInfo } from "./member-info.mjs";
export class ReferencePropertyMemberInfo extends MemberInfo {
   /**
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} classMemberInfoId
    * @param {ContainerConfigNode} referencePropertyConfigNode
    */
   constructor(containerRefId, classMemberInfoId, referencePropertyConfigNode) {
      if (new.target !== ReferencePropertyMemberInfo) {
         throw new Error(`can't inherit from ${ReferencePropertyMemberInfo.name}`);
      }
      referencePropertyConfigNode.find([], referencePropertyConfigNode.key, (config) => {
         if (config.mockType && !process.environment.isProduction) {
            super(referencePropertyConfigNode.key, config.mockType, config.args, config.isPublic, null, false, true, false);
         } else {
            super(referencePropertyConfigNode.key, config.class, config.args, config.isPublic, null, false, true, false);
         }
      });
      super.addReference(containerRefId, Container.prototype);
      super.addReference(classMemberInfoId, ClassMemberInfo.prototype);
   }
}
