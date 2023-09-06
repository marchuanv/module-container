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
      const classMemberInfoConfig = classConfigNode.find(['args', 'ctor', 'classMock', 'isInterface', 'isSingleton',
         'isHaltOnErrors', 'isPublic', 'referenceProperties', 'staticProperties', 'methods'], classConfigNode.key);
      const { args, isPublic, ctor, isSingleton, isInterface, methods, staticProperties, referenceProperties } = classMemberInfoConfig;
      super(classConfigNode.key, null, args, isPublic, null, true, false, true, ctor);
      privateBag.set(this, { isSingleton, isInterface });
      if ((Array.isArray(methods) && methods.length > 0) || (methods && !Array.isArray(methods))) {
         this.configureMethods(methods);
      }
      if ((Array.isArray(staticProperties) && staticProperties.length > 0) || (staticProperties && !Array.isArray(staticProperties))) {
         this.configureStaticProperties(staticProperties);
      }
      if ((Array.isArray(referenceProperties) && referenceProperties.length > 0) || (referenceProperties && !Array.isArray(referenceProperties))) {
         this.configureReferenceProperties(referenceProperties);
      }
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
      const referenceProperties = referencePropertiesConfig.find([], 'referenceProperties');
      for (const property of Object.keys(referenceProperties)) {
         const referencePropertyConfig = referenceProperties[property];
         const referencePropertyMemberInfo = new ReferencePropertyMemberInfo(this.Id, referencePropertyConfig);
         super.addReference(referencePropertyMemberInfo.Id, ReferencePropertyMemberInfo.prototype);
      }
   }
   /**
   * @param {ContainerConfigNode} staticPropertiesConfig
   */
   configureStaticProperties(staticPropertiesConfig) {
      const staticProperties = staticPropertiesConfig.find([], 'staticProperties');
      for (const property of Object.keys(staticProperties)) {
         const staticPropertyConfig = staticProperties[property];
         const staticPropertyMemberInfo = new StaticPropertyMemberInfo(this.Id, staticPropertyConfig);
         super.addReference(staticPropertyMemberInfo.Id, StaticPropertyMemberInfo.prototype);
      }
   }
   /**
   * @param {ContainerConfigNode} methodsConfig
   */
   configureMethods(methodsConfig) {
      const methods = methodsConfig.find([], 'methods');
      for (const method of Object.keys(methods)) {
         const methodConfig = methods[method];
         const methodMemberInfo = new MethodMemberInfo(this.Id, methodConfig);
         super.addReference(methodMemberInfo.Id, MethodMemberInfo.prototype);
      }
   }
}