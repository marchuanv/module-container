import utils from "utils";
import { MemberEvent } from "./member-event.mjs";
const membersInfo = new Map();
const memberInstances = new Map();

export class Member {
   constructor({ memberInfo, context, isProxy = false }) {
      this.Id = utils.generateGUID();

      addToMembersInfo({ context, memberInfo });
      if (memberInfo.isClass || memberInfo.isContainerClass || memberInfo.isValueType) {
         const propertyMemberEvent = new MemberEvent({ memberInfo, context });
         const raisePrivatePropertyGetterSetterEvent = (data) => {
            return new Promise((resolve, reject) => {
               propertyMemberEvent.raise({ data, resolve, reject, timeoutMill: 3 });
            });
         }
         if (!isProxy) {
            propertyMemberEvent.subscribe(propertyMemberCallback);
         }
         Object.defineProperty(context, memberInfo.name, { configurable: false, get: raisePrivatePropertyGetterSetterEvent, set: raisePrivatePropertyGetterSetterEvent });
      } else if (memberInfo.isPublic) {
         const publicMemberEvent = new MemberEvent({ memberInfo, context });
         const raisePublicAsyncFuncMemberEvent = (data) => {
            return new Promise((resolve, reject) => {
               publicMemberEvent.raise({ data, resolve, reject, timeoutMill: 1 });
            });
         }
         if (!isProxy) {
            publicMemberEvent.subscribe(publicMemberEventCallback);
         }
         Object.defineProperty(context, memberInfo.name, { configurable: false, value: raisePublicAsyncFuncMemberEvent });
      } else if (memberInfo.isAsync) {
         const privateMemberEvent = new MemberEvent({ memberInfo, context });
         const raisePrivateAsyncFuncMemberEvent = (data) => {
            return new Promise(async (resolve, reject) => {
               privateMemberEvent.raise({ data, resolve, reject, timeoutMill: 2 });
            });
         }
         if (!isProxy) {
            privateMemberEvent.subscribe(privateMemberEventCallback);
         }
         return Object.defineProperty(context, memberInfo.name, { configurable: false, value: raisePrivateAsyncFuncMemberEvent });
      }
   }
}

const propertyMemberCallback = function ({ memberInfo, data }) {
   return new Promise(async (resolve, reject) => {
      const logging = this.logging;
      if (memberInfo.isValueType) {
         if (data !== undefined && data !== null) {
            memberInfo.value = data;
         }
         return resolve(memberInfo.value);
      }
      if (memberInfo.isClass || memberInfo.isContainerClass) {
         let instance = getInstance({ memberInfo });
         if (instance) {
            return resolve(instance);
         }
         if (!Array.isArray(memberInfo.func)) {
            memberInfo.func = [memberInfo.func];
         }
         const instances = [];
         for (const Class of memberInfo.func) {
            if (typeof Class === 'function') {
               try {
                  const instance = new Class(memberInfo.args);
                  instances.push(instance);
                  await logging.log(`created instance of ${instance.constructor.name}`);
               } catch (error) {
                  if (memberInfo.errorHalt) {
                     await logging.log(error);
                     reject(error);
                  } else {
                     await logging.log(error);
                     return resolve(memberInfo.errorReturn);
                  }
               }
            } else {
               reject(new Error('member is not a class'));
            }
         }
         setInstances({ memberInfo, instances });
         instance = getInstance({ memberInfo });
         return resolve(instance);
      }
   });
}

const publicMemberEventCallback = function ({ memberInfo, data }) {
   return new Promise(async (resolve, reject) => {
      const logging = this.logging;
      try {
         const privateAsyncMembers = getMembersInfo({ context: this })
            .filter(m => !m.isPublic && m.Id !== memberInfo.Id && m.isAsync && !m.isClass && !m.isContainerClass && m.enabled)
         for (const dependantMember of privateAsyncMembers) {
            await this[dependantMember.name].call(this, dependantMember.args);
            dependantMember.enabled = false;
         }
         const func = memberInfo.func[0];
         const output = await func.call(this, data);
         resolve(output);
      } catch (error) {
         if (memberInfo.errorHalt) {
            await logging.log(error);
            reject(error);
         } else {
            await logging.log(error);
            return resolve(memberInfo.errorReturn);
         }
      }
   });
}

const privateMemberEventCallback = async function ({ memberInfo, data }) {
   return new Promise(async (resolve, reject) => {
      const logging = this.logging;
      for (const func of memberInfo.func) {
         try {
            const output = await func.call(this, data);
            resolve(output);
         } catch (error) {
            if (memberInfo.errorHalt) {
               await logging.log(error);
               reject(error);
            } else {
               await logging.log(error);
               return resolve(memberInfo.errorReturn);
            }
         }
      }
   });
}

const getInstances = ({ memberInfo }) => {
   if (!memberInstances.has(memberInfo.Id)) {
      memberInstances.set(memberInfo.Id, []);
   }
   return memberInstances.get(memberInfo.Id);
}
const setInstances = ({ memberInfo, instances }) => {
   if (memberInstances.has(memberInfo.Id)) {
      memberInstances.delete(memberInfo.Id);
      memberInstances.set(memberInfo.Id, instances);
   } else {
      memberInstances.set(memberInfo.Id, []);
   }
}
const getInstance = ({ memberInfo }) => {
   const instances = getInstances({ memberInfo });
   if (instances && instances.length === 1) {
      return instances[0];
   } else if (instances && instances.length > 0) {
      return instances;
   }
}
const getMembersInfo = ({ context }) => {
   if (!membersInfo.has(context.contextId)) {
      membersInfo.set(context.contextId, []);
   }
   return membersInfo.get(context.contextId);
}
const addToMembersInfo = ({ context, memberInfo }) => {
   return getMembersInfo({ context }).push(memberInfo);
}