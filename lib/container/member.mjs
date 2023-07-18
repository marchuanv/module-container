import utils from "utils";
const contextLock = new WeakMap();
const stackContext = new WeakMap();
const membersInfo = new Map();
const contextInstances = new Map();
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
          Object.defineProperty(context, memberInfo.name, {
             configurable: false,
             get: () => this.property.call(context, { memberInfo, args: null, value: null }),
             set: (value) => this.property.call(context, { memberInfo, args: null, value })
          });
       } else if (memberInfo.isPublic) {
          Object.defineProperty(context, memberInfo.name, {
             configurable: false, value: async (_args) => {
                addToCallStack({ context, funcName: memberInfo.name });
                await this.resolveDependencies.call(context, { memberInfo });
                for (const func of memberInfo.func) {
                   try {
                      return await func.call(context, _args);
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
          });
       } else if (memberInfo.isAsync) {
          Object.defineProperty(context, memberInfo.name, {
             configurable: false, value: async (_args) => {
                for (const func of memberInfo.func) {
                   try {
                      return await func.call(context, _args);
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
          });
       }
    }
    async resolveDependencies({ memberInfo }, timeoutMill = 10) {
       const context = this;
       return new Promise((resolve, reject) => {
          setTimeout(async () => {
             try {
                if (contextLock.has(context)) {
                   try {
                      await resolveDependencies.call(context, { memberInfo }, timeoutMill + 10);
                   } catch (error) {
                      console.log(error);
                      return memberInfo.haltValue;
                   }
                } else {
                   contextLock.set(context, true);
                   if (memberInfo.isPublic) {
                      for (const dependantMember of getMembersInfo({ context }).filter(m => !m.isPublic && m.Id !== memberInfo.Id)) {
                         if (dependantMember.isAsync && !dependantMember.isClass && !dependantMember.isContainerClass) {
                            await context[dependantMember.name].call(context, dependantMember.args);
                         }
                      }
                   }
                   resolve();
                }
             } catch (error) {
                reject(error);
             } finally {
                contextLock.delete(context);
             }
          }, timeoutMill);
       });
    }
    property({ memberInfo, value }) {
      const context = this;
      if (!isCallStackValid({ context })) {
         throw new Error(`Unable to access member: ${memberInfo.name}, it is private to: ${context.contextId}`);
      }
      if (memberInfo.isValueType) {
         if (value !== undefined && value !== null) {
            memberInfo.value = value;
         }
         return memberInfo.value;
      }
      if (memberInfo.isClass || memberInfo.isContainerClass) {
         const instance = getInstance({ context, memberInfo });
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
         setInstances({ context, memberInfo, instances });
         return getInstance({ context, memberInfo });
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
 const getCallStack = ({ context }) => {
    if (!stackContext.has(context)) {
        stackContext.set(context, []);
    }
    return stackContext.get(context);
 }
 const addToCallStack = ({ context, funcName }) => {
    const stack = getCallStack({ context });
    if (!stack[0] || ( stack[0] && stack[0].function !== funcName) ) {
        stack.unshift({ context: context.constructor.name, function: funcName });
    }
 }
 const isCallStackValid = ({ context }) => {
    const stack = getCallStack({ context })
    const stackItem = stack.shift();
    let isValidStackCall = false;
    if (stackItem && stackItem.context === context.constructor.name) {
       isValidStackCall = true;
       if (stackItem.function !== 'constructor') {
          stack.unshift(stackItem);
       }
    }
    return isValidStackCall;
 }