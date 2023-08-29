import { ClassMemberInfo } from "./class-member-info.mjs";
import { ContainerConfigNode } from "./container-config-node.mjs";
import { Reference } from "./reference/reference.mjs";
export class Container extends Reference {
   /**
    * @param {ContainerConfigNode} containerConfigNode
    */
   constructor(containerConfigNode) {
      if (new.target !== Container) {
         throw new Error(`can't inherit from ${Container.name}`);
      }
      containerConfigNode.find(['name', 'class'], 'container', (config) => {
         super(config.name);
         const classMemberInfo = new ClassMemberInfo(config.class);
         classMemberInfo.dependency = this.Id;
         this.dependency = classMemberInfo.Id;
      });
   }
}