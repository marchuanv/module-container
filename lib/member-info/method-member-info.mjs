import { ContainerConfigNode } from "../container-config-node.mjs";
import { MemberInfo } from "./member-info.mjs";
export class MethodMemberInfo extends MemberInfo {
   /**
    * @param {ContainerConfigNode} methodConfigNode,
    * @param {Boolean} isSingleton
    */
   constructor(methodConfigNode, isSingleton) {
      if (new.target !== MethodMemberInfo) {
         throw new Error(`can't inherit from ${MethodMemberInfo.name}`);
      }
      methodConfigNode.find(['args', 'callback', 'isPublic'], methodConfigNode.key, (config) => {
         super(methodConfigNode.key, config.callback, config.args, config.isPublic, null, true, false, false, isSingleton);
      });
   }
}
