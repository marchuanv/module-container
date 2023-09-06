import utils from "utils";
import { ContainerConfigNode } from "./container-config-node.mjs";
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
      containerConfigNode.find([], 'container', (config) => {
         const classNames = Object.keys(config);
         if (classNames.length === 0) {
            throw new Error('container could not find any class configuration');
         }
      });
      containerConfigNode.find([], 'container', (config) => {
         for (const className of Object.keys(config)) {
            let classConfigNode = config[className];
            classConfigNode.find(['classMock'], classConfigNode.key, (config2) => {
               if (!utils.isEmptyObject(config2.classMock)) {
                  const mockClassKey = Object.keys(config2.classMock)[0];
                  const mockClassConfigNode = config[mockClassKey];
                  classConfigNode.remove();
                  mockClassConfigNode.key = classConfigNode.key;
               }
            });
         }
      });
      containerConfigNode.find([], 'container', (config) => {
         for (const className of Object.keys(config)) {
            let classConfigNode = config[className];
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
   }
   /**
   * @param { string } name
   * @return { Object }
   */
   async getReference(name) {
      const classMembersInfo = super.getAllReferences(ClassMemberInfo.prototype);
      const classMemberInfo = classMembersInfo.find(x => x.name === name);
      if (!classMemberInfo) {
         throw new Error(`instance of ${name} not found.`);
      }
      const classMemberInfo_membersInfo = classMemberInfo.getAllReferences(ReferencePropertyMemberInfo.prototype)
         .concat(classMemberInfo.getAllReferences(StaticPropertyMemberInfo.prototype))
         .concat(classMemberInfo.getAllReferences(MethodMemberInfo.prototype));
      const otherClassMemberInfoDependencies = classMemberInfo_membersInfo.map(cmi => {
         return cmi.getAllReferences(ClassMemberInfo.prototype).find(x => x.Id !== classMemberInfo.Id);
      }).filter(x => x);
      for (const otherClassMemberInfo of otherClassMemberInfoDependencies) {
         const classMember = new ClassMember(otherClassMemberInfo.Id);
         await classMember.constructor();
         otherClassMemberInfo.addReference(classMember.Id, ClassMember.prototype);
      }
      const classMember = new ClassMember(classMemberInfo.Id);
      await classMember.constructor();
      return classMember;
   }
}