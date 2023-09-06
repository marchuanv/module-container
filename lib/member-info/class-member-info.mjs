import { ContainerConfigNode } from "../container-config-node.mjs";
import { MemberInfo } from "./member-info.mjs";
import { MethodMemberInfo } from "./method-member-info.mjs";
import { ReferencePropertyMemberInfo } from "./reference-property-member-info.mjs";
import { StaticPropertyMemberInfo } from "./static-property-member-info.mjs";
const privateBag = new WeakMap();
export class ClassMemberInfo extends MemberInfo {
   /**
    * @param {ContainerConfigNode} classConfigNode
    */
   constructor(classConfigNode) {
      if (new.target !== ClassMemberInfo) {
         throw new Error(`can't inherit from ${ClassMemberInfo.name}`);
      }
      classConfigNode.find(['args', 'ctor', 'classMock', 'isInterface', 'isSingleton', 'isHaltOnErrors', 'isPublic', 'referenceProperties', 'staticProperties', 'methods'], classConfigNode.key, (config) => {
         super(classConfigNode.key, null, config.args, config.isPublic, null, true, false, true, config.ctor);
         privateBag.set(this, {
            isSingleton: config.isSingleton,
            isInterface: config.isInterface
         });
         if ((Array.isArray(config.methods) && config.methods.length > 0) || (config.methods && !Array.isArray(config.methods))) {
            this.configureMethods(config.methods);
         }
         if ((Array.isArray(config.staticProperties) && config.staticProperties.length > 0) || (config.staticProperties && !Array.isArray(config.staticProperties))) {
            this.configureStaticProperties(config.staticProperties);
         }
         if ((Array.isArray(config.referenceProperties) && config.referenceProperties.length > 0) || (config.referenceProperties && !Array.isArray(config.referenceProperties))) {
            this.configureReferenceProperties(config.referenceProperties);
         }
      });
   }
   get isInterface() {
      const { isInterface } = privateBag.get(this);
      return isInterface;
   }
   get isSingleton() {
      const { isSingleton } = privateBag.get(this);
      return isSingleton;
   }
   /**
   * @param {ContainerConfigNode} referencePropertiesConfig
   */
   configureReferenceProperties(referencePropertiesConfig) {
      referencePropertiesConfig.reset();
      referencePropertiesConfig.find([], 'referenceProperties', (config) => {
         for (const property of Object.keys(config)) {
            const referencePropertyConfig = config[property];
            const referencePropertyMemberInfo = new ReferencePropertyMemberInfo(
               this.Id,
               referencePropertyConfig
            );
            super.addReference(referencePropertyMemberInfo.Id, ReferencePropertyMemberInfo.prototype);
         }
      });
   }
   /**
   * @param {ContainerConfigNode} staticPropertiesConfig
   */
   configureStaticProperties(staticPropertiesConfig) {
      staticPropertiesConfig.reset();
      staticPropertiesConfig.find([], 'staticProperties', (config) => {
         for (const property of Object.keys(config)) {
            const staticPropertyConfig = config[property];
            const staticPropertyMemberInfo = new StaticPropertyMemberInfo(
               this.Id,
               staticPropertyConfig
            );
            super.addReference(staticPropertyMemberInfo.Id, StaticPropertyMemberInfo.prototype);
         }
      });
   }
   /**
   * @param {ContainerConfigNode} methodsConfig
   */
   configureMethods(methodsConfig) {
      methodsConfig.reset();
      methodsConfig.find([], 'methods', (config) => {
         for (const method of Object.keys(config)) {
            const methodConfig = config[method];
            const methodMemberInfo = new MethodMemberInfo(
               this.Id,
               methodConfig
            );
            super.addReference(methodMemberInfo.Id, MethodMemberInfo.prototype);
         }
      });
   }
   /**
    * 
    * @param {Object[]} membersConfig 
    */
   configureAllMembers(membersConfig) {
      const classMemberConfig = memberConfig.find(config => memberInfo.Class && memberInfo.Class[config.name]);
      if (classMemberConfig) {
         super.addReference(memberInfo.Id, MemberInfo);
      }
   }
}