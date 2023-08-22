import utils from "utils";
import { MemberInfo } from "./member-info.mjs";
import { Member } from "./member.mjs";
import { ContainerConfig } from "./container-config.mjs";
import { ContainerConfigTemplate } from "./container-config-template.mjs";

const configTemplate = new ContainerConfigTemplate();
const containers = new WeakMap();
const containerKeys = [];
class Logging {
   log(message) {
      console.log(message);
   }
}

export class Container extends Logging {
   constructor(config) {
      super();
      const contextId = utils.generateGUID();
      const contextName = this.constructor.name;
      if (contextName === Container.name) {
         throw new Error('Container is an abstract class');
      }
      containerKeys.push(this);
      containers.set(this, {
         config: new ContainerConfig(configTemplate, config),
         singleton: false,
         contextId,
         contextName,
         originalMemberNames: Object.getOwnPropertyNames(this.constructor.prototype),
         context: this,
         membersInfo: [],
         isConfigured: false,
         errorHalt: true,
         references: new WeakMap(),
         interface: false
      });
      connfigure.call(this);
      Object.freeze(this);
   }
}

const connfigure = function () {
   let container = containers.get(this);
   container.config.reset();
   container.config.find('behaviour', (node) => {
      node.reset();
      while (node.nextChild) {
         node.currentChild.find('singleton', (node) => {
            container.singleton = (typeof node.value === "boolean") ? node.value : false;
         });
         node.currentChild.find('errorHalt', (node) => {
            container.errorHalt = (typeof node.value === "boolean") ? node.value : false;
         });
      }
   });
   if (container.singleton) {
      for (const conKey of containerKeys) {
         const _con = containers.get(conKey);
         if (_con.contextName === container.contextName && _con.contextId !== container.contextId) {
            const existingContainer = containers.get(conKey);
            containers.delete(container.context);
            containers.set(container.context, {
               config: existingContainer.config,
               singleton: true,
               contextId: existingContainer.contextId,
               contextName: existingContainer.contextName,
               originalMemberNames: existingContainer.originalMemberNames,
               context: this,
               membersInfo: existingContainer.membersInfo,
               isConfigured: true,
               errorHalt: existingContainer.errorHalt,
               references: existingContainer.references,
               interface: true
            });
            container = containers.get(container.context);
         }
      }
   }
   if (container.isConfigured) {
      for (const memberInfo of container.membersInfo) {
         const member = new Member({ container, memberInfo });
         member.create();
      }
   } else {
      validatePublicMembers(container);
      setupPublicMembers(container);
      setupPrivateMembers(container);
      for (const privatePropertyMemberInfo of container.membersInfo.filter(x => !x.isPublic && x.isProperty)) {
         for (const publicMemberInfo of container.membersInfo.filter(x => x.isPublic && (x.isFunction || x.isProperty))) {
            privatePropertyMemberInfo.children.push(publicMemberInfo);
            publicMemberInfo.parent = privatePropertyMemberInfo;
         }
      }
      for (const privateFunctionMemberInfo of container.membersInfo.filter(x => !x.isPublic && x.isFunction)) {
         for (const publicMemberInfo of container.membersInfo.filter(x => x.isPublic && (x.isFunction || x.isProperty))) {
            privateFunctionMemberInfo.children.push(publicMemberInfo);
            publicMemberInfo.parent = privateFunctionMemberInfo;
         }
      }
      for (const memberInfo of container.membersInfo) {
         if (memberInfo.isPublic) {
            memberInfo.errorHalt = container.errorHalt;
         }
         const member = new Member({ container, memberInfo });
         member.create();
      }
   }
   container.isConfigured = true;
}

const validatePublicMembers = function (container) {
   const asyncMembers = container.membersInfo.filter(mi => mi.isAsync);
   if (container.membersInfo.length !== asyncMembers.length) {
      throw new Error(`all members of ${container.contextName} must be async`);
   }
}

const setupPublicMembers = function (container) {
   const memberExlusions = ['constructor'];
   for (const memberName of container.originalMemberNames.filter(name => !memberExlusions.find(excl => excl === name))) {
      const member = container.context.constructor.prototype[memberName];
      if (!member) {
         throw new Error('this should not happen');
      }
      container.membersInfo.push(new MemberInfo(memberName, member, {}, true, null, true, false, false));
   }
};

const setupPrivateMembers = function (container) {
   container.config.reset();
   container.config.find('members', (node) => {
      node.reset();
      while (node.nextChild) {
         let type = null;
         let args = null;
         let key = node.currentChild.key;
         let value = null;
         let callback = null;
         let mockType = null;
         node.currentChild.find('class', (node) => {
            type = Object.keys(node.value).map(key => node.value[key]);
         });
         node.currentChild.find('args', (node) => {
            args = node.value;
         });
         node.currentChild.find('mock', (node) => {
            mockType = Object.keys(node.value).map(key => node.value[key]);
         });
         node.currentChild.find('value', (node) => {
            value = node.value;
         });
         node.currentChild.find('callback', (node) => {
            callback = node.value;
         });
         if (type && args) {
            if (mockType && !process.environment.isProduction) {
               container.membersInfo.push(new MemberInfo(key, mockType, args, false, null, false, true, false));
            } else {
               container.membersInfo.push(new MemberInfo(key, type, args, false, null, false, true, false));
            }
         } else if (key && value !== undefined && value !== null) {
            container.membersInfo.push(new MemberInfo(key, null, null, false, value, false, true, false));
         } else if (callback && args) {
            container.membersInfo.push(new MemberInfo(key, callback, args, false, null, true, false, true));
         }
      }
   });
}
