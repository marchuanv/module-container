import { MemberReference } from "./references/member-reference.mjs";
import { ReferenceId } from "./references/referenceId.mjs";
export class Member extends MemberReference {
   /**
    * @param { String } name
    * @param { ReferenceId } containerRefId
    * @param { ReferenceId } memberInfoRefId
    * @param { ReferenceId } memberEventSubsriberRefId
    * @param { ReferenceId } memberEventPublisherRefId
    */
   constructor(name, containerRefId, memberInfoRefId, memberEventSubsriberRefId, memberEventPublisherRefId) {
      super(name);
      super.dependency = containerRefId;
      super.dependency = memberInfoRefId;
      super.dependency = memberEventSubsriberRefId;
      super.dependency = memberEventPublisherRefId;
   }
   async create() {
      const container = super.container;
      const memberInfo = super.memberInfo;
      if (!container.interface) {
         if (memberInfo.isProperty) {
            super.memberEventSubscriber.subscribe(() => {
               const containerReferences = container.references;
               let singleton = containerReferences.get(Singletons).find(s => memberInfo.func.find(Class => Class === s.Class));
               if (singleton) {
                  container.context.log(`singleton reference found for ${memberInfo.name}(${memberInfo.Id}) member.`);
                  return singleton.instance;
               } else if (containerReferences.has(memberInfo)) {
                  container.context.log(`reference found for ${memberInfo.name}(${memberInfo.Id}) member.`);
                  return containerReferences.get(memberInfo);
               } else if (memberInfo.isValueType) {
                  if (data !== undefined && data !== null) {
                     memberInfo.value = data;
                  }
                  containerReferences.set(memberInfo, memberInfo.value);
                  return memberInfo.value;
               } else if (memberInfo.isClass || memberInfo.isContainerClass) {
                  if (memberInfo.func.length === 1) {
                     const Class = memberInfo.func[0];
                     const instance = new Class(memberInfo.args);
                     if (instance.singleton) {
                        containerReferences.get(Singletons).push({ Class, instance });
                     }
                     return instance;
                  } else {
                     const Classes = memberInfo.func;
                     const instances = [];
                     for (const Class of Classes) {
                        const instance = new Class(memberInfo.args);
                        if (instance.singleton) {
                           containerReferences.get(Singletons).push({ Class, instance });
                           return instance;
                        }
                        instances.push(instance);
                     }
                     return instances;
                  }
               }
            });
         }
         if (memberInfo.isFunction) {
            super.memberEventSubscriber.subscribe(async () => {
               const context = container.context;
               try {
                  const func = memberInfo.func[0];
                  return await func.call(context, data);
               } catch (error) {
                  await context.log(error);
                  throw error;
               }
            });
         }
      }
      const publishEvent = async (data) => {
         return await super.memberEventPublisher.publish({ data });
      }
      if (memberInfo.isProperty) {
         Object.defineProperty(container.context, memberInfo.name, { configurable: false, get: publishEvent, set: publishEvent });
      }
      if (memberInfo.isFunction) {
         Object.defineProperty(container.context, memberInfo.name, { configurable: false, value: publishEvent });
      }
   }
}