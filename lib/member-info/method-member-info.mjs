import { ContainerConfigNode } from "../container-config-node.mjs";
import { ClassMemberInfo } from "./class-member-info.mjs";
import { MemberInfo } from "./member-info.mjs";
export class MethodMemberInfo extends MemberInfo {
   /**
    * @param {ReferenceId} classMemberInfoId
    * @param {ContainerConfigNode} methodConfigNode
    */
   constructor(classMemberInfoId, methodConfigNode) {
      if (new.target !== MethodMemberInfo) {
         throw new Error(`can't inherit from ${MethodMemberInfo.name}`);
      }
      const methodConfig = methodConfigNode.find(['args', 'callback', 'isPublic'], methodConfigNode.key);
      const { callback, args, isPublic } = methodConfig;
      super(methodConfigNode.key, callback, args, isPublic, null, true, false, false);
      super.addReference(classMemberInfoId, ClassMemberInfo.prototype);
   }
}
