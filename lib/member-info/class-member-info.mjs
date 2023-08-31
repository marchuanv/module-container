import { ContainerConfigNode } from "../container-config-node.mjs";
import { Container } from "../container.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberInfo } from "./member-info.mjs";
import { MethodMemberInfo } from "./method-member-info.mjs";
import { ReferencePropertyMemberInfo } from "./reference-property-member-info.mjs";
import { StaticPropertyMemberInfo } from "./static-property-member-info.mjs";
const privateBag = new WeakMap();
export class ClassMemberInfo extends MemberInfo {
   /**
    * @param {ReferenceId} containerReferenceId
    * @param {ContainerConfigNode} classConfigNode
    */
   constructor(containerReferenceId, classConfigNode) {
      if (new.target !== ClassMemberInfo) {
         throw new Error(`can't inherit from ${ClassMemberInfo.name}`);
      }
      classConfigNode.find(['name', 'isSingleton', 'isInterface', 'args', 'ctor', 'methods', 'staticProperties', 'referenceProperties'], 'class', (config) => {
         super(config.name, config.ctor, config.args, config.isPublic, null, true, false, true);
         this.dependency = containerReferenceId;
         privateBag.set(this, {
            isSingleton: config.isSingleton,
            isInterface: config.isInterface
         });
         this.configureMethods(config.methods);
         this.configureStaticProperties(config.staticProperties);
         this.configureReferenceProperties(config.referenceProperties);
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
      const container = this.get(Container.prototype);
      referencePropertiesConfig.reset();
      referencePropertiesConfig.find([], 'referenceProperties', (config) => {
         for (const property of Object.keys(config)) {
            const referencePropertyConfig = config[property];
            const referencePropertyMemberInfo = new ReferencePropertyMemberInfo(
               container.Id,
               this.Id,
               referencePropertyConfig
            );
            this.dependency = referencePropertyMemberInfo.Id;
         }
      });
   }
   /**
   * @param {ContainerConfigNode} staticPropertiesConfig
   */
   configureStaticProperties(staticPropertiesConfig) {
      const container = this.get(Container.prototype);
      staticPropertiesConfig.reset();
      staticPropertiesConfig.find([], 'staticProperties', (config) => {
         for (const property of Object.keys(config)) {
            const staticPropertyConfig = config[property];
            const staticPropertyMemberInfo = new StaticPropertyMemberInfo(
               container.Id,
               this.Id,
               staticPropertyConfig
            );
            this.dependency = staticPropertyMemberInfo.Id;
         }
      });
   }
   /**
   * @param {ContainerConfigNode} methodsConfig
   */
   configureMethods(methodsConfig) {
      const container = this.get(Container.prototype);
      methodsConfig.reset();
      methodsConfig.find([], 'methods', (config) => {
         for (const method of Object.keys(config)) {
            const methodConfig = config[method];
            const methodMemberInfo = new MethodMemberInfo(
               container.Id,
               this.Id,
               methodConfig
            );
            this.dependency = methodMemberInfo.Id;
         }
      });
   }
}
