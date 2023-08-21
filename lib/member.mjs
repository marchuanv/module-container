import { MemberEvent } from "./member-event.mjs";
const memberInstances = new Map();
const events = new Map();
export class Member {
   static async createMember({ memberInfo, context }) {
      const raiseEvent = async (data) => {
         const memberEvent = events.get(memberInfo.Id);
         return await memberEvent.raise({ data, timeoutMill: 100 });
      }
      if (memberInfo.isProperty) {
         if (!memberInfo.isInterface) {
            const memberEvent = new MemberEvent({ memberInfo, context });
            memberEvent.subscribe(propertyMemberCallback);
            events.set(memberInfo.Id, memberEvent);
         }
         Object.defineProperty(context, memberInfo.name, { configurable: false, get: raiseEvent, set: raiseEvent });
      }
      if (memberInfo.isFunction) {
         if (!memberInfo.isInterface) {
            const memberEvent = new MemberEvent({ memberInfo, context });
            memberEvent.subscribe(functionMemberCallback);
            events.set(memberInfo.Id, memberEvent);
         }
         Object.defineProperty(context, memberInfo.name, { configurable: false, value: raiseEvent });
      }
   }
}

const propertyMemberCallback = async function ({ memberInfo, data }) {
   if (memberInfo.isValueType) {
      if (data !== undefined && data !== null) {
         memberInfo.value = data;
      }
      return memberInfo.value;
   }
   if (memberInfo.isClass || memberInfo.isContainerClass) {
      let instance = getInstance({ memberInfo });
      if (instance) {
         return instance;
      }
      const instances = [];
      for (const Class of memberInfo.func) {
         if (typeof Class === 'function') {
            try {
               const instance = new Class(memberInfo.args);
               instances.push(instance);
               await this.log(`created instance of ${instance.constructor.name}`);
            } catch (error) {
               await this.log(error);
               throw error;
            }
         } else {
            throw new Error('member is not a class');
         }
      }
      setInstances({ memberInfo, instances });
      instance = getInstance({ memberInfo });
      return instance;
   }
}

const functionMemberCallback = async function ({ memberInfo, data }) {
   try {
      const func = memberInfo.func[0];
      return await func.call(this, data);
   } catch (error) {
      await this.log(error);
      throw error;
   }
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