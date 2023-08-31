import { ContainerConfigNode } from "./container-config-node.mjs";
import { EventManager } from "./event/event-manager.mjs";
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
      super('container');
      const eventManager = new EventManager(this.Id);
      containerConfigNode.find([], 'container', (config) => {
         const classNames = Object.keys(config);
         for (const className of classNames) {
            const classConfigNode = config[className];
            const classMemberInfo = new ClassMemberInfo(classConfigNode);
            super.addReference(classMemberInfo.Id, ClassMemberInfo.prototype);
            super.addReference(eventManager.Id, EventManager.prototype);
         }
      });
   }
   /**
   * @param { string } name
   * @return { Object }
   */
   async getReference(name) {
      const eventManager = super.getReference(EventManager.prototype);
      const classMemberInfo = super.getAllReferences(ClassMemberInfo.prototype).find(x => x.name === name);
      const classMember = new ClassMember(
         classMemberInfo.Id,
         eventManager.raisedEventSubscriptionStackReferenceId,
         eventManager.memberEventSubscriptionStackReferenceId,
         eventManager.memberEventStackReferenceId
      );
      eventManager.raiseEvents();
      await classMember.constructor(classMemberInfo.args);
      return classMember;
   }
}