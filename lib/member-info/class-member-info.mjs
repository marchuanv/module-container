import { ContainerConfigNode } from "../container-config-node.mjs";
import { MemberInfo } from "./member-info.mjs";
import { MethodMemberInfo } from "./method-member-info.mjs";
import { PropertyMemberInfo } from "./property-member-info.mjs";
export class ClassMemberInfo extends MemberInfo {
   /**
    * @param {ContainerConfigNode} classConfigNode
    */
   constructor(classConfigNode) {
      if (new.target !== ClassMemberInfo) {
         throw new Error(`can't inherit from ${ClassMemberInfo.name}`);
      }
      classConfigNode.find(['name', 'isSingleton', 'isInterface', 'args', 'ctor', 'methods', 'properties'], 'class', (config) => {
         if (config.isInterface) {
            throw new Error('interface capability is not implemented');
         }
         super(config.name, config.ctor, config.args, config.isPublic, null, true, false, true, config.isSingleton);
         this.configureMethods(config.methods, config.isSingleton);
         this.configureProperties(config.properties, config.isSingleton);
      });
   }
   /**
   * @param {ContainerConfigNode} propertiesConfig
   * @param {Boolean} isSingleton
   */
   configureProperties(propertiesConfig, isSingleton) {
      propertiesConfig.reset();
      propertiesConfig.find([], 'properties', (config) => {
         for (const property of Object.keys(config)) {
            const propertyConfig = config[property];
            const propertyMemberInfo = new PropertyMemberInfo(propertyConfig, isSingleton);
            this.dependency = propertyMemberInfo.Id;
         }
      });
   }
   /**
   * @param {ContainerConfigNode} methodsConfig
   * @param {Boolean} isSingleton
   */
   configureMethods(methodsConfig, isSingleton) {
      methodsConfig.reset();
      methodsConfig.find([], 'methods', (config) => {
         for (const method of Object.keys(config)) {
            const methodConfig = config[method];
            const methodMemberInfo = new MethodMemberInfo(methodConfig, isSingleton);
            this.dependency = methodMemberInfo.Id;
         }
      });
   }
}
