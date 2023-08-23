import { MemberEvent } from "./member-event.mjs";
const references = new WeakMap();
export class Member {
   constructor({ container, memberInfo }) {
      references.set(this, { container, memberInfo });
   }
   async create() {
      const { container, memberInfo } = references.get(this);
      const raiseEvent = async (data) => {
         const memberEvent = container.events.get(memberInfo.Id);
         const output = await memberEvent.raise({ data });
         return output;
      }
      if (!container.interface) {
         const memberEvent = new MemberEvent({ member: this });
         if (memberInfo.isProperty) {
            memberEvent.subscribe(propertyMemberCallback);
         }
         if (memberInfo.isFunction) {
            memberEvent.subscribe(functionMemberCallback);
         }
         container.events.set(memberInfo.Id, memberEvent);
      }
      if (memberInfo.isProperty) {
         Object.defineProperty(container.context, memberInfo.name, { configurable: false, get: raiseEvent, set: raiseEvent });
      }
      if (memberInfo.isFunction) {
         Object.defineProperty(container.context, memberInfo.name, { configurable: false, value: raiseEvent });
      }
   }
   get Id() {
      const { memberInfo } = references.get(this);
      return memberInfo.Id;
   }
   get name() {
      const { memberInfo } = references.get(this);
      return memberInfo.name;
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
   const containerReferences = container.references;
   if (containerReferences.has(member.info)) {
      container.context.log(`reference found in container for ${member.info.name}(${member.info.Id}) member.`);
      return containerReferences.get(member.info);
   }
   if (member.info.isValueType) {
      if (data !== undefined && data !== null) {
         member.info.value = data;
      }
      containerReferences.set(member.info, member.info.value);
   } else if (member.info.isClass || member.info.isContainerClass) {
      if (member.info.func.length === 1) {
         const Class = member.info.func[0];
         const instance = new Class(member.info.args);
         containerReferences.set(member.info, instance);
      } else {
         const Classes = member.info.func;
         containerReferences.set(member.info, []);
         const instances = containerReferences.get(member.info);
         for (const Class of Classes) {
            const instance = new Class(member.info.args);
            instances.push(instance);
            containerReferences.set(member.info, instances);
         }
      }
   }
   return containerReferences.get(member.info);
}

const functionMemberCallback = async function ({ data }) {
   const member = this;
   const context = member.container.context;
   try {
      const func = member.info.func[0];
      return await func.call(context, data);
   } catch (error) {
      await context.log(error);
      throw error;
   }
}