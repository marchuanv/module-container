import utils from "utils";
import { Reference } from "./reference.mjs";
export class Member {
   constructor({ containerId, memberInfoId }) {
      this.Id = utils.generateGUID();
      Reference.create({ object: this, metadata: { containerId, memberInfoId } });
   }
   async create() {
      const { containerId, memberInfoId } = Reference.metadata(this);
      const { container } = Reference.object({ Id: containerId });
      const { memberInfo } = Reference.object({ Id: memberInfoId });

      const raiseEvent = async (data) => {
         const memberEvent = container.references.get(memberInfo.Id);
         const output = await memberEvent.raise({ data });
         return output;
      }
      if (!container.interface) {
         const { member } = Reference.get(this);
         const { memberEvent, memberInfo } = Reference.get(member);
         if (memberInfo.isProperty) {
            memberEvent.subscribe(propertyMemberCallback);
         }
         if (memberInfo.isFunction) {
            memberEvent.subscribe(functionMemberCallback);
         }
         Reference.create({ object: memberEvent, reference: Reference.get(this) });
         Reference.create({ object: this, reference: Reference.get(memberEvent) });
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
   let singleton = containerReferences.get(Singletons).find(s => member.info.func.find(Class => Class === s.Class));
   if (singleton) {
      container.context.log(`singleton reference found for ${member.info.name}(${member.info.Id}) member.`);
      return singleton.instance;
   } else if (containerReferences.has(member.info)) {
      container.context.log(`reference found for ${member.info.name}(${member.info.Id}) member.`);
      return containerReferences.get(member.info);
   } else if (member.info.isValueType) {
      if (data !== undefined && data !== null) {
         member.info.value = data;
      }
      containerReferences.set(member.info, member.info.value);
      return member.info.value;
   } else if (member.info.isClass || member.info.isContainerClass) {
      if (member.info.func.length === 1) {
         const Class = member.info.func[0];
         const instance = new Class(member.info.args);
         if (instance.singleton) {
            containerReferences.get(Singletons).push({ Class, instance });
         }
         return instance;
      } else {
         const Classes = member.info.func;
         const instances = [];
         for (const Class of Classes) {
            const instance = new Class(member.info.args);
            if (instance.singleton) {
               containerReferences.get(Singletons).push({ Class, instance });
               return instance;
            }
            instances.push(instance);
         }
         return instances;
      }
   }
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