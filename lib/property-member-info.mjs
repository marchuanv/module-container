import { ContainerConfigNode } from "./container-config-node.mjs";
import { MemberInfo } from "./member-info.mjs";
export class PropertyMemberInfo extends MemberInfo {
   /**
    * @param {ContainerConfigNode} propertyConfigNode,
    * @param {Boolean} isSingleton
    */
   constructor(propertyConfigNode, isSingleton) {
      if (new.target !== PropertyMemberInfo) {
         throw new Error(`can't inherit from ${PropertyMemberInfo.name}`);
      }
      propertyConfigNode.find([], propertyConfigNode.key, (config) => {
         if (config.mockType && !process.environment.isProduction) {
            super(propertyConfigNode.key, config.mockType, config.args, config.isPublic, null, false, true, false, isSingleton);

         } else if (config.value) {
            super(propertyConfigNode.key, null, null, config.isPublic, config.value, false, true, false, isSingleton);

         } else {
            super(propertyConfigNode.key, config.class, config.args, config.isPublic, null, false, true, false, isSingleton);
         }
      });
   }
}
