import { ContainerConfigNode } from "./container-config-node.mjs";
import { EventManager } from "./event-manager.mjs";
import { ClassMemberInfo } from "./member-info/class-member-info.mjs";
import { ClassMember } from "./member/class-member.mjs";
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
         const eventManager = new EventManager(this.Id);
         const classMemberInfo = new ClassMemberInfo(this.Id, config.class);
         const classMember = new ClassMember(this.Id, classMemberInfo.Id, eventManager.Id);
         this.dependency = classMember.Id;
         this.dependency = classMemberInfo.Id;
         this.dependency = eventManager.Id;
         eventManager.raiseEvents();
      });
   }
}