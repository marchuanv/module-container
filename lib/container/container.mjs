import utils from "utils";
import { ConfigTemplate } from "./config-template.mjs";
import { MemberInfo } from "./member-info.mjs";
import { Member } from "./member.mjs";
import { Logging } from "./logging.mjs";

const membersInfo = new Map();
const originalPrototypes = new Map();
const singletons = new Map();
const loggers = new Map();

export class Container {
   constructor(config) {
      const context = this;
      const contextPrototype = context.constructor.prototype;
      const contextName = this.constructor.name;
      if (contextName === Container.name) {
         throw new Error('Container is an abstract class');
      }
      this.contextId = utils.generateGUID();
      const contextId = this.contextId;
      loggers.set(contextId, new Logging({ contextId, contextName }));
      if (!originalPrototypes.has(contextId)) {
         originalPrototypes.set(contextId, Object.getOwnPropertyNames(contextPrototype));
      }
      if (!configureForSingleton({ config, context })) {
         if (areAllPublicMembersAsync({ context })) {
            mapPublicMembers({ context });
            mapPrivateMembers({ config, context });
            configureMockedMembers({ config, context });
            configureMembersBehaviour({ config, context });
            mapMemberDependencies({ config, context });
            setupMembers({ context });
         } else {
            throw new Error(`all members of ${context.constructor.name} must be async`);
         }
      }
   }
   get logging() {
      return loggers.get(this.contextId);
   }
}

const areAllPublicMembersAsync = ({ context }) => {
   const _membersInfo = getMembersInfo({ context });
   const asyncMembers = _membersInfo.filter(mi => mi.isAsync);
   return _membersInfo.length === asyncMembers.length;
}

const configureForSingleton = ({ config, context }) => {
   const contextName = context.constructor.name;
   const configTemplateMatch = new ConfigTemplate({ name: 'behaviour' });
   let isConfigured = false;
   getConfig({
      config, configTemplateMatch, callback: ({ singleton }) => {
         const isSingleton = (typeof singleton === "boolean") ? singleton : false;
         if (isSingleton && !singletons.has(contextName)) {
            singletons.delete(contextName);
            singletons.set(contextName, context);
            isConfigured = false;
            return;
         }
         if (singletons.has(contextName)) {
            const singletonContext = singletons.get(contextName);
            proxyMembers({ sourceContext: singletonContext, destinationContext: context });
            isConfigured = true;
            return;
         }
         isConfigured = false;
      }
   });
   return isConfigured;
}


const mapPublicMembers = ({ context }) => {
   const memberExlusions = ['logging', 'constructor'];
   const originalPrototype = originalPrototypes.get(context.contextId);
   const memberNames = originalPrototype.filter(prop => !memberExlusions.find(excl => excl === prop));
   const newMembersInfo = memberNames.map((memberName) => {
      const member = context.constructor.prototype[memberName];
      if (!member) {
         throw new Error('this should not happen');
      }
      return new MemberInfo(memberName, member, {}, true, null, false, true, false, false);
   });
   for (const newMemberInfo of newMembersInfo) {
      getMembersInfo({ context }).push(newMemberInfo);
   }
};

const mapPrivateMembers = ({ config, context }) => {
   const configTemplateMatch = new ConfigTemplate({ name: 'members' });
   getConfig({
      config, configTemplateMatch, callback: ({ name, value, type, callback, args }) => {
         let memberInfo = null;
         if (type && args) {
            args.contextId = context.contextId;
            memberInfo = new MemberInfo(name, type, args, false, null, false, false, true, false);
         } else if (name && value !== undefined) {
            memberInfo = new MemberInfo(name, null, null, false, value, false, false, true, false);
         } else if (callback && args) {
            memberInfo = new MemberInfo(name, callback, args, false, null, false, true, false, true);
         }
         getMembersInfo({ context }).push(memberInfo);
      }
   });
}

const mapMemberDependencies = ({ context }) => {
   for (const publicMemberInfo of getMembersInfo({ context }).filter(x => x.isPublic && (x.isFunction || x.isProperty))) {
      for (const privatePropertyMemberInfo of getMembersInfo({ context }).filter(x => !x.isPublic && x.isProperty)) {
         publicMemberInfo.dependencies.push(privatePropertyMemberInfo);
      }
      for (const privateFunctionMemberInfo of getMembersInfo({ context }).filter(x => !x.isPublic && x.isFunction)) {
         publicMemberInfo.dependencies.push(privateFunctionMemberInfo);
      }
   }
}

const configureMockedMembers = ({ config, context }) => {
   const configTemplateMatch = new ConfigTemplate({ name: 'mocks' });
   getConfig({
      config, configTemplateMatch, callback: ({ type, mockType, args }) => {
         for (let i = 0; i < getMembersInfo({ context }).length; i++) {
            const dependencyMember = getMembersInfo({ context })[i];
            if (dependencyMember.isClass && dependencyMember.isContainerClass &&
               dependencyMember.func.find(f => type.find(x => x.name === f.name))) {
               {
                  const { name } = getMembersInfo({ context }).splice(i, 1)[0];
                  const memberInfo = new MemberInfo(name, mockType, args, false, null, false, false, true, false);
                  getMembersInfo({ context }).push(memberInfo);
               }
            }
         }
      }
   });
}

const configureMembersBehaviour = ({ config, context }) => {
   const configTemplateMatch = new ConfigTemplate({ name: 'behaviour' });
   getConfig({
      config, configTemplateMatch, callback: ({ func, errorHalt }) => {
         for (let i = 0; i < getMembersInfo({ context }).length; i++) {
            const memberInfo = getMembersInfo({ context })[i];
            memberInfo.errorHalt = errorHalt;
         }
      }
   });
}

const getConfig = ({ config, configTemplateMatch, callback }) => {
   walkConfigTree({
      config, callback: ({ name, value, children }) => {
         const configTemplate = new ConfigTemplate({ name });
         if (configTemplate.exists() && configTemplate.id === configTemplateMatch.id && configTemplateMatch.exists()) {
            const object = {};
            object[name] = value;
            switch (configTemplate.id) {
               case 'members': {
                  if (configTemplate.match({ object })) {
                     for (const childNode of children) {
                        const nameNode = childNode;
                        const valueNode = childNode.children.find(x => x.name === 'value');
                        const classNode = childNode.children.find(x => x.name === 'class');
                        const argsNode = childNode.children.find(x => x.name === 'args');
                        if (nameNode !== undefined && valueNode !== undefined) {
                           callback({ name: childNode.name, value: valueNode.value });
                        } else if (classNode !== undefined && argsNode !== undefined) {
                           const types = Object.keys(classNode.value).map(key => classNode.value[key]);
                           callback({ name: childNode.name, type: types, args: argsNode.value });
                        } else if (childNode.value.callback && argsNode !== undefined) {
                           callback({ name: childNode.name, callback: childNode.value.callback, args: argsNode.value });
                        } else {
                           console.error(new Error('error determining member'));
                        }
                     }
                  }
                  break;
               }
               case 'behaviour': {
                  if (configTemplate.match({ object })) {
                     const singletonNode = children.find(x => x.name === 'singleton');
                     const errorHaltNode = children.find(x => x.name === 'errorHalt');
                     callback({
                        errorHalt: errorHaltNode.value,
                        singleton: singletonNode.value
                     });
                  }
                  break;
               }
               case 'mocks': {
                  if (configTemplate.match({ object })) {
                     for (const childNode of children) {
                        const classNode = childNode.children.find(x => x.name === 'class');
                        const mockClassNode = childNode.children.find(x => x.name === 'mockClass');
                        const argsNode = childNode.children.find(x => x.name === 'args');
                        if (classNode && mockClassNode && argsNode) {
                           const types = Object.keys(classNode.value).map(key => classNode.value[key]);
                           const typesFake = Object.keys(mockClassNode.value).map(key => mockClassNode.value[key]);
                           callback({ name, type: types, mockType: typesFake, args: argsNode.value });
                        } else {
                           console.error(new Error('error getting class config'));
                        }
                     }
                  }
                  break;
               }
               default: {
                  throw new Error('unknow configuration');
               }
            }
         }
      }
   });
};

const getMembersInfo = ({ context }) => {
   if (!membersInfo.has(context.contextId)) {
      membersInfo.set(context.contextId, []);
   }
   return membersInfo.get(context.contextId);
}

const setupMembers = ({ context }) => {
   for (const memberInfo of getMembersInfo({ context })) {
      setupMember({ memberInfo, context });
   }
}

const proxyMembers = ({ sourceContext, destinationContext }) => {
   for (const memberInfo of getMembersInfo({ context: sourceContext })) {
      memberInfo.proxy();
      setupMember({ memberInfo, context: destinationContext });
   }
}

const setupMember = ({ memberInfo, context }) => {
   const member = new Member({ memberInfo, context });
   member.createMember();
}

const walkConfigTree = ({ config, callback, currentNode, track = [] }) => {
   if (!currentNode) {
      currentNode = buildConfigTreeNode({ config });
   }
   if (!track.find(id => id === currentNode.id)) {
      track.push(currentNode.id);
      callback(currentNode);
   }
   for (const child of currentNode.children) {
      walkConfigTree({ config, callback, currentNode: child, track });
   }
}

const buildConfigTreeNode = ({ config, node }) => {
   if (!node) {
      node = {
         id: utils.generateGUID(),
         name: 'root',
         value: null,
         children: []
      };
   }
   if (config && Array.isArray(config)) {
      let adjustedConfig = config.map(x => {
         const key = Object.keys(x)[0];
         return { key, value: x[key] };
      });
      config = adjustedConfig.reduce((obj, item) => {
         obj[item.key] = item.value;
         return obj;
      }, {});
   }
   if (config && typeof config === 'object') {
      for (const name of Object.keys(config)) {
         const value = config[name];
         const id = utils.generateGUID();
         if (typeof value !== 'function') {
            const childNode = buildConfigTreeNode({
               config: value,
               node: { id, name, value, children: [] }
            });
            node.children.push(childNode);
         }
      }
   }
   return node;
}