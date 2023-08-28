import { ContainerConfigTemplate } from "./container-config-template.mjs";
import { ContainerConfig } from "./container-config.mjs";
import { MemberEventCallStack } from "./member-event-callstack.mjs";
import { MemberEventQueue } from "./member-event-queue.mjs";
import { MemberInfo } from "./member-info.mjs";
import { RaisedEventLogging } from "./raised-event-logging.mjs";
import { Reference } from "./reference/reference.mjs";
const configTemplate = new ContainerConfigTemplate();
const memberEventQueue = new MemberEventQueue();
const memberEventCallStack = new MemberEventCallStack();
const raisedEventLogging = new RaisedEventLogging();
export class Container extends Reference {
   constructor(config) {
      if (new.target === Container) {
         throw new Error('Container is an abstract class');
      }
      let name = null;
      config = new ContainerConfig(configTemplate, config);
      config.find('name', (node) => {
         node.reset();
         name = node.value;
      });
      super(name);
      super.data.config = config;
      super.data.isSingleton = false;
      super.data.Id = this.Id;
      super.data.name = this.name;
      super.data.originalMemberNames = Object.getOwnPropertyNames(this.constructor.prototype);
      super.data.membersInfo = [];
      super.data.isConfigured = false;
      super.data.errorHalt = true;
      super.data.interface = false;
      super.data.config.reset();
      super.data.config.find('behaviour', (node) => {
         node.reset();
         while (node.nextChild) {
            node.currentChild.find('singleton', (node) => {
               super.data.isSingleton = (typeof node.value === "boolean") ? node.value : false;
            });
            node.currentChild.find('errorHalt', (node) => {
               super.data.errorHalt = (typeof node.value === "boolean") ? node.value : false;
            });
         }
      });
      if (super.data.isSingleton) {
         const existingContainer = super.get(this.constructor.prototype);
         super.data.config = existingContainer.config;
         super.data.isSingleton = existingContainer.isSingleton;
         super.data.isSingleton = existingContainer.isSingleton;
         super.data.originalMemberNames = existingContainer.originalMemberNames;
         super.data.isConfigured = existingContainer.isConfigured;
         super.data.errorHalt = existingContainer.errorHalt;
         super.data.interface = existingContainer.interface;
         super.data.membersInfo = existingContainer.membersInfo;
      }
      if (super.data.isConfigured) {
         for (const memberInfo of super.data.membersInfo) {
            const member = new Member({ container, memberInfo });
            member.create();
         }
      } else {
         const classMemberInfo = new MemberInfo(this.name, this.constructor, configTemplate, true, null, true, false, false, super.data.isSingleton, true, null, null);
         const memberExlusions = ['constructor'];
         for (const memberName of super.data.originalMemberNames.filter(name => !memberExlusions.find(excl => excl === name))) {
            const prototype = this.constructor.prototype;
            const member = prototype[memberName];
            if (!member) {
               throw new Error('this should not happen');
            }
            delete prototype[memberName];
            super.data.membersInfo.push(new MemberInfo(memberName, member, {}, true, null, true, false, false, super.data.isSingleton, false, this.Id, classMemberInfo.Id));
         }
         const asyncMembers = super.data.membersInfo.filter(mi => mi.isAsync);
         if (super.data.membersInfo.length !== asyncMembers.length) {
            throw new Error(`all members of ${super.name} must be async`);
         }
         super.data.config.reset();
         super.data.config.find('members', (node) => {
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
                     super.data.membersInfo.push(new MemberInfo(key, mockType, args, false, null, false, true, false));
                  } else {
                     super.data.membersInfo.push(new MemberInfo(key, type, args, false, null, false, true, false));
                  }
               } else if (key && value !== undefined && value !== null) {
                  super.data.membersInfo.push(new MemberInfo(key, null, null, false, value, false, true, false));
               } else if (callback && args) {
                  super.data.membersInfo.push(new MemberInfo(key, callback, args, false, null, true, false, true));
               }
            }
         });
         for (const memberInfo of super.data.membersInfo) {
            if (memberInfo.isPublic) {
               memberInfo.errorHalt = this.data.errorHalt;
            }
            const memberEvent = new MemberEvent(
               `${memberInfo.name} _event`,
               memberInfo.Id,
               memberEventQueue.Id,
               super.Id,
               memberEventCallStack.Id,
               raisedEventLogging.Id
            );
            const memberEventSubscriber = new MemberEventSubscriber(
               `${memberInfo.name} _event_subscriber`,
               memberEvent.Id,
               memberEventQueue.Id
            );
            const memberEventPublisher = new MemberEventPublisher(
               `${memberInfo.name} _event_publisher`,
               memberEvent.Id,
               memberEventQueue.Id
            );
            const member = new Member(name, container.Id, memberInfo.Id, memberEventSubscriber.Id, memberEventPublisher.Id);
            for (const depMemberInfo of member.memberInfo.membersInfo) {
               Member.create(depMemberInfo.name, depMemberInfo.container, depMemberInfo, raisedEventLogging, memberEventCallStack, memberEventQueue);
            }
            member.create();
         }
      }
      super.data.isConfigured = true;
      Object.freeze(this);
   }
   /**
    * @return { Boolean }
    */
   get isSingleton() {
      const { isSingleton } = super.data;
      return isSingleton;
   }
}