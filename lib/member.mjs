import { MemberEvent } from "./member-event.mjs";
const events = new Map();
const references = new WeakMap();
export class Member {
   constructor({ container, memberInfo }) {
      references.set(this, { container, memberInfo });
   }
   async create() {
      const { container, memberInfo } = references.get(this);
      const raiseEvent = async (data) => {
         const memberEvent = events.get(memberInfo.Id);
         return await memberEvent.raise({ data });
      }
      if (!container.interface) {
         const memberEvent = new MemberEvent({ member: this });
         if (memberInfo.isProperty) {
            memberEvent.subscribe(propertyMemberCallback);
         }
         if (memberInfo.isFunction) {
            memberEvent.subscribe(functionMemberCallback);
         }
         events.set(memberInfo.Id, memberEvent);
      }
      if (memberInfo.isProperty) {
         Object.defineProperty(container.context, memberInfo.name, { configurable: false, get: raiseEvent, set: raiseEvent });
      }
      if (memberInfo.isFunction) {
         Object.defineProperty(container.context, memberInfo.name, { configurable: false, value: raiseEvent });
      }
   }
   get info() {
      const { memberInfo } = references.get(this);
      return memberInfo;
   }
   get container() {
      const { container } = references.get(this);
      return container;
   }
}

const propertyMemberCallback = async function ({ data }) {
   const member = this;
   const container = member.container;
   const containerContext = container.context;
   const containerReferences = container.references;
   if (containerReferences.has(member)) {
      return containerReferences.get(member);
   }
   if (member.info.isValueType) {
      if (data !== undefined && data !== null) {
         member.info.value = data;
      }
      containerReferences.set(member, member.info.value);
   } else if (member.info.isClass || member.info.isContainerClass) {
      if (member.info.func.length === 1) {
         const Class = member.info.func[0];
         const instance = new Class(member.info.args);
         containerReferences.set(member, instance);
      } else {
         throw new Error('not implemented.');
         for (const Class of member.info.func) {
            if (typeof Class === 'function') {
               try {

                  await containerContext.log(`created instance of ${instance.constructor.name}`);
               } catch (error) {
                  await containerContext.log(error);
                  throw error;
               }
            } else {
               throw new Error('member is not a class');
            }
         }
      }
   }
   return containerReferences.get(member);
}

const functionMemberCallback = async function ({ data }) {
   const member = this;
   try {
      const func = member.info.func[0];
      return await func.call(member.container.context, data);
   } catch (error) {
      await member.container.context.log(error);
      throw error;
   }
}