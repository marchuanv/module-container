import utils from "utils";
import { MemberEvent } from "./member-event.mjs";
const memberInstances = new Map();
const events = new Map();
export class Member {
   constructor({ memberInfo, context }) {
      this.Id = utils.generateGUID();
      this.memberInfo = memberInfo;
      this.context = context;
   }
   createMember() {
      const memberInfo = this.memberInfo;
      const context = this.context;
      const memberAccessCallback = async () => {
         throw new Error('unable to access private member');
      }
      const raisePublicEvent = (data) => {
         return new Promise(async (resolve, reject) => {
            for (const depMemberInfo of memberInfo.dependencies) {
               const raisePrivateEvent = (_data) => {
                  return new Promise(async (_resolve, _reject) => {
                     const memberEvent = events.get(depMemberInfo.Id);
                     await memberEvent.raise({ data: _data, resolve: _resolve, reject: _reject, timeoutMill: 100 });
                     setTimeout(() => {
                        const _memberInfo = memberEvent.memberInfo;
                        if (_memberInfo.isProperty) {
                           Object.defineProperty(context, _memberInfo.name, { configurable: true, get: memberAccessCallback, set: memberAccessCallback });
                        }
                        if (_memberInfo.isFunction) {
                           Object.defineProperty(context, _memberInfo.name, { configurable: true, value: memberAccessCallback });
                        }
                     }, 1000);
                  });
               }
               if (depMemberInfo.isProperty) {
                  Object.defineProperty(context, depMemberInfo.name, { configurable: true, get: raisePrivateEvent, set: raisePrivateEvent });
               }
               if (depMemberInfo.isFunction) {
                  Object.defineProperty(context, depMemberInfo.name, { configurable: true, value: raisePrivateEvent });
               }
               depMemberInfo.enable = true;
            }
            const memberEvent = events.get(memberInfo.Id);
            await memberEvent.raise({ data, resolve, reject, timeoutMill: 100 });

         });
      }
      if (!memberInfo.isProxy && memberInfo.isProperty) {
         const memberEvent = new MemberEvent({ memberInfo, context });
         memberEvent.subscribe(propertyMemberCallback);
         events.set(memberInfo.Id, memberEvent);
      }
      if (!memberInfo.isProxy && memberInfo.isFunction) {
         const memberEvent = new MemberEvent({ memberInfo, context });
         memberEvent.subscribe(functionMemberCallback);
         events.set(memberInfo.Id, memberEvent);
      }
      if (memberInfo.isProperty && memberInfo.isPublic) {
         Object.defineProperty(context, memberInfo.name, { configurable: false, get: raisePublicEvent, set: raisePublicEvent });
      }
      if (memberInfo.isFunction && memberInfo.isPublic) {
         Object.defineProperty(context, memberInfo.name, { configurable: false, value: raisePublicEvent });
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

const functionMemberCallback = function ({ memberInfo, data }) {
   return new Promise(async (resolve, reject) => {
      const logging = this.logging;
      try {
         const func = memberInfo.func[0];
         const output = await func.call(this, data);
         resolve(output);
      } catch (error) {
         await logging.log(error);
         reject(error);
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