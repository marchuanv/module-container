import { ContainerConfigNode } from "./container-config-node.mjs";
import { EventManager } from "./event/event-manager.mjs";
import { ClassMemberInfo } from "./member-info/class-member-info.mjs";
import { MethodMemberInfo } from "./member-info/method-member-info.mjs";
import { ReferencePropertyMemberInfo } from "./member-info/reference-property-member-info.mjs";
import { StaticPropertyMemberInfo } from "./member-info/static-property-member-info.mjs";
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
         }
      });
      const classMembersInfo = super.getAllReferences(ClassMemberInfo.prototype);
      for (const classMemberInfo of classMembersInfo) {
         let membersInfo = classMemberInfo.getAllReferences(ReferencePropertyMemberInfo.prototype)
            .concat(classMemberInfo.getAllReferences(StaticPropertyMemberInfo.prototype))
            .concat(classMemberInfo.getAllReferences(MethodMemberInfo.prototype));
         for (const otherClassMemberInfo of classMembersInfo.filter(cmi => membersInfo.find(mi => mi.Class && mi.Class[cmi.name]))) {
            for (const memberInfo of membersInfo.filter(mi => mi.Class && mi.Class[otherClassMemberInfo.name])) {
               memberInfo.addReference(otherClassMemberInfo.Id, ClassMemberInfo.prototype);
            }
         }
      }
      super.addReference(eventManager.Id, EventManager.prototype);
   }
   /**
   * @param { string } name
   * @return { Object }
   */
   async getReference(name) {
      const eventManager = super.getReference(EventManager.prototype);
      const classMemberInfo = super.getAllReferences(ClassMemberInfo.prototype).find(x => x.name === name);
      if (!classMemberInfo) {
         throw new Error(`instance of ${name} not found.`);
      }
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