import utils from "utils";

const contextLock = new WeakMap();
const eventStack = new WeakMap();
const membersInfo = new Map();
const contextInstances = new Map();

const eventSubscriptions = new Map();
class MemberEvent {
   constructor({ memberInfo, args, promise, context }) {
      this.name = memberInfo.name;
      this.context = context.constructor.name;
      if (!eventSubscriptions.has(memberInfo.Id)) {
         eventSubscriptions.set(memberInfo.Id, []);
      } else {
         if (!eventStack.has(context)) {
            eventStack.set(context, []);
         }
         if (memberInfo.isPublic) {
            const events = eventStack.get(context);
            events.unshift(this);
         }
         const _memberInfo = memberInfo;
         const _args = args;
         const _promise = promise;
         {
            for (const { context, callback } of eventSubscriptions.get(memberInfo.Id)) {
               callback.call(context, { memberInfo: _memberInfo, args: _args, value: _args }).then((output) => {
                  _promise.resolve(output);
               }).catch((error) => _promise.reject(error));
            }
         }
      }
   }
}
class MemberEventSubscription {
   constructor({ memberInfo, context, callback }) {
      if (!eventSubscriptions.has(memberInfo.Id)) {
         eventSubscriptions.set(memberInfo.Id, []);
      }
      eventSubscriptions.get(memberInfo.Id).push({ context, callback });
   }
}

export class Member {
   constructor({ memberInfo, context }) {
      if (contextInstances.has(context.contextId)) {
         const memberInstances = contextInstances.get(context.contextId);
         memberInstances.set(memberInfo.Id, []);
      } else {
         const memberInstances = new Map();
         memberInstances.set(memberInfo.Id, []);
         contextInstances.set(context.contextId, memberInstances);
      }
      addToMembersInfo({ context, memberInfo });
      this.Id = utils.generateGUID();
      if (memberInfo.isClass || memberInfo.isContainerClass || memberInfo.isValueType) {
         new MemberEventSubscription({ memberInfo, context, callback: propertyMemberCallback });
      } else if (memberInfo.isPublic) {
         new MemberEventSubscription({ memberInfo, context, callback: publicMemberEventCallback });
      } else if (memberInfo.isAsync) {
         new MemberEventSubscription({ memberInfo, context, callback: privateMemberEventCallback });
      }
      createMember({ context, memberInfo });
   }
}

const propertyMemberCallback = async function ({ memberInfo, value }) {
   if (!isPublicMemberEventRaised({ context: this })) {
      throw new Error(`Unable to access member: ${memberInfo.name}, it is private to: ${this.contextId}`);
   }
   if (memberInfo.isValueType) {
      if (value !== undefined && value !== null) {
         memberInfo.value = value;
      }
      return memberInfo.value;
   }
   if (memberInfo.isClass || memberInfo.isContainerClass) {
      const instance = getInstance({ context: this, memberInfo });
      if (instance) {
         return instance;
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
               console.log(`created new instance of ${instance.contextId}`);
            } catch (error) {
               if (memberInfo.errorHalt) {
                  throw (error);
               } else {
                  console.error(error);
                  return memberInfo.return;
               }
            }
         } else {
            throw new Error('member is not a class');
         }
      }
      setInstances({ context: this, memberInfo, instances });
      return getInstance({ context: this, memberInfo });
   }
}

const publicMemberEventCallback = async function ({ memberInfo, args }) {
   const resolveDependencies = (timeoutMill) => {
      return new Promise((resolve, reject) => {
         setTimeout(async () => {
            try {
               if (contextLock.has(this)) {
                  try {
                     await resolveDependencies(timeoutMill + 10);
                  } catch (error) {
                     console.log(error);
                     return memberInfo.haltValue;
                  }
               } else {
                  contextLock.set(this, true);
                  if (memberInfo.isPublic) {
                     for (const dependantMember of getMembersInfo({ context: this }).filter(m => !m.isPublic && m.Id !== memberInfo.Id)) {
                        if (dependantMember.isAsync && !dependantMember.isClass && !dependantMember.isContainerClass) {
                           await this[dependantMember.name].call(this, dependantMember.args);
                        }
                     }
                  }
                  resolve();
               }
            } catch (error) {
               reject(error);
            } finally {
               contextLock.delete(this);
            }
         }, timeoutMill);
      });
   }
   await resolveDependencies(10);
   for (const func of memberInfo.func) {
      try {
         return await func.call(this, args);
      } catch (error) {
         if (memberInfo.errorHalt) {
            throw (error);
         } else {
            console.error(error);
            return memberInfo.return;
         }
      }
   }
}

const privateMemberEventCallback = async function ({ memberInfo, args }) {
   for (const func of memberInfo.func) {
      try {
         return await func.call(context, args);
      } catch (error) {
         if (memberInfo.errorHalt) {
            throw (error);
         } else {
            console.error(error);
            return memberInfo.return;
         }
      }
   }
}

const getInstances = ({ context, memberInfo }) => {
   const memberInstances = contextInstances.get(context.contextId);
   return memberInstances.get(memberInfo.Id);
}
const setInstances = ({ context, memberInfo, instances }) => {
   contextInstances.get(context.contextId).delete(memberInfo.Id);
   contextInstances.get(context.contextId).set(memberInfo.Id, instances);
}
const getInstance = ({ context, memberInfo }) => {
   const instances = getInstances({ context, memberInfo });
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
const isPublicMemberEventRaised = ({ context }) => {
   if (!eventStack.has(context)) {
      eventStack.set(context, []);
   }
   const events = eventStack.get(context);
   const event = events.shift();
   let isRaised = false;
   if (event && event.context === context.constructor.name) {
      isRaised = true;
   }
   return isRaised;
}
const createMember = function ({ context, memberInfo }) {
   const raiseEvent = (args) => {
      return new Promise((resolve, reject) => { new MemberEvent({ memberInfo, args, promise: { resolve, reject }, context }); });
   }
   if (memberInfo.isClass || memberInfo.isContainerClass || memberInfo.isValueType) {
      return Object.defineProperty(context, memberInfo.name, { configurable: false, get: raiseEvent, set: raiseEvent });
   } else if (memberInfo.isPublic || memberInfo.isAsync) {
      return Object.defineProperty(context, memberInfo.name, { configurable: false, value: raiseEvent });
   }
   throw new Error(`could not create property for member: ${utils.getJSONString(memberInfo)}`);
}