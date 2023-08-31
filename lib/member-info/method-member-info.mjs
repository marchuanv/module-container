import { ContainerConfigNode } from "../container-config-node.mjs";
import { Container } from "../container.mjs";
import { ClassMemberInfo } from "./class-member-info.mjs";
import { MemberInfo } from "./member-info.mjs";
export class MethodMemberInfo extends MemberInfo {
   /**
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} classMemberInfoId
    * @param {ContainerConfigNode} methodConfigNode
    */
   constructor(containerRefId, classMemberInfoId, methodConfigNode) {
      if (new.target !== MethodMemberInfo) {
         throw new Error(`can't inherit from ${MethodMemberInfo.name}`);
      }
      methodConfigNode.find(['args', 'callback', 'isPublic'], methodConfigNode.key, (config) => {
         super(methodConfigNode.key, config.callback, config.args, config.isPublic, null, true, false, false);
      });
      super.addReference(containerRefId, Container.prototype);
      super.addReference(classMemberInfoId, ClassMemberInfo.prototype);
   }
}
