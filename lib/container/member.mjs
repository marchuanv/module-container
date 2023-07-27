import utils from "utils";
import { MemberEvent } from "./member-event.mjs";
const privateMemberInfo = new Map();
const memberInstances = new Map();

export class Member {
   constructor({ memberInfo, context }) {
      this.Id = utils.generateGUID();
      if (memberInfo.isClass || memberInfo.isContainerClass || memberInfo.isValueType) {
         if (!memberInfo.isProxy) {
            const propertyMemberEvent = new MemberEvent({ memberInfo, context });
            propertyMemberEvent.subscribe(propertyMemberCallback);
         }
         const raisePrivatePropertyGetterSetterEvent = (data) => {
            return new Promise( async (resolve, reject) => {
               await MemberEvent.getEvent({ memberInfo }).raise({ data, resolve, reject, timeoutMill: 300 });
            });
         }
         Object.defineProperty(context, memberInfo.name, { configurable: false, get: raisePrivatePropertyGetterSetterEvent, set: raisePrivatePropertyGetterSetterEvent });
      } else if (memberInfo.isPublic) {
         if (!memberInfo.isProxy) {
            const publicMemberEvent = new MemberEvent({ memberInfo, context });
            publicMemberEvent.subscribe(publicMemberEventCallback);
         }
         const raisePublicAsyncFuncMemberEvent = (data) => {
            return new Promise( async (resolve, reject) => {
               await MemberEvent.getEvent({ memberInfo }).raise({ data, resolve, reject, timeoutMill: 100 });
            });
         }
         Object.defineProperty(context, memberInfo.name, { configurable: false, value: raisePublicAsyncFuncMemberEvent });
      } else if (memberInfo.isAsync) {
         if (!memberInfo.isProxy) {
            const privateMemberEvent = new MemberEvent({ memberInfo, context });
            privateMemberEvent.subscribe(privateMemberEventCallback);
            mapPrivateMemberInfo({ context, memberInfo });
         }
         const raisePrivateAsyncFuncMemberEvent = (data) => {
            return new Promise( async (resolve, reject) => {
               await MemberEvent.getEvent({ memberInfo }).raise({ data, resolve, reject, timeoutMill: 200 });
            });
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
                  await logging.log(error);
                  reject(error);
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
         const privateAsyncMembers = getPrivateMembersInfo({ context: this })
            .filter(m => !m.isPublic && m.Id !== memberInfo.Id && m.isAsync && !m.isClass && !m.isContainerClass && m.enabled)
         for (const dependantMember of privateAsyncMembers) {
            await this[dependantMember.name].call(this, dependantMember.args);
            dependantMember.enabled = false;
         }
         const func = memberInfo.func[0];
         const output = await func.call(this, data);
         resolve(output);
      } catch (error) {
         await logging.log(error);
         reject(error);
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
            await logging.log(error);
            reject(error);
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
const getPrivateMembersInfo = ({ context }) => {
   if (!privateMemberInfo.has(context.contextId)) {
      privateMemberInfo.set(context.contextId, []);
   }
   return privateMemberInfo.get(context.contextId);
}
const mapPrivateMemberInfo = ({ context, memberInfo }) => {
   return getPrivateMembersInfo({ context }).push(memberInfo);
}