import { resolve } from "path";
import utils from "utils";
import vm from "vm";

class MemberInfo {
   constructor(name, ctor, args, context, isPublic, resolve) {
      this.name = name;
      this.member = ctor || resolve;
      this.args = args;
      this.context = context;
      this.isPublic = isPublic;
      const _name = ctor ? ctor.name : name;
      const script = this.member.toString().replace(/\s+/g, '');
      this.asyncProp = script.startsWith(`async${_name}(`) || script.startsWith(`async(`);
      this.promiseProp = script.indexOf('Promise(') > -1;
      this.resolve = resolve;
   }
   get isAsync() {
      return this.asyncProp || this.promiseProp;
   }
}
const anonymousIds = [];
const originalPrototypes = new Map();
export class Container {
   constructor() {
      if (!originalPrototypes.has(this.constructor.name)) {
         originalPrototypes.set(this.constructor.name, Object.getOwnPropertyNames(this.constructor.prototype));
      }
      let stack = [];
      if (areAllPublicMembersAsync({ context: this })) {
         wrapMembersFromPrototype({ context: this, stack });
      } else {
         throw new Error(`all members of ${this.constructor.name} must be async`);
      }
      let lock = false;
      this.dependency = (obj) => {
         if (lock) {
            return setTimeout(() => this.dependency(obj), 100);
         }
         lock = true;
         if (typeof obj === 'function') {
            const id = utils.generateGUID();
            anonymousIds.unshift(id);
            const memberInfo = new MemberInfo(id, null, obj.ctorArgs || {}, this, false, obj);
            stack.push({ member: memberInfo, priority: 2 });
         } else {
            for (const key of Object.keys(obj)) {
               if (typeof obj[key] === 'function' && obj[key].toString().replace(/\s+/g, '').startsWith('class')) {
                  const Class = obj[key];
                  let name = Class.name;
                  name = name.charAt(0).toLowerCase() + name.slice(1);
                  const memberInfo = new MemberInfo(name, Class, obj.ctorArgs || {}, this, false);
                  stack.push({ member: memberInfo, priority: 1 });
               } else  if (typeof obj[key] === 'object' && obj[key].toString().replace(/\s+/g, '').startsWith('class')) {
                  const Class = obj[key];
                  let name = Class.name;
                  name = name.charAt(0).toLowerCase() + name.slice(1);
                  const memberInfo = new MemberInfo(name, Class, obj.ctorArgs || {}, this, false);
                  stack.push({ member: memberInfo, priority: 1 });
               }
            }
         }
         lock = false;
      }
      setInterval(async () => {
         if (lock) {
            return true;
         }
         if (stack.length === 0) {
            return;
         }
         stack = stack.sort((x, y) => x.priority - y.priority);
         const { member: { context, name, member, args, resolve, value }, priority } = stack.shift();
         if (priority === 1) {
            this[name] = new member(args);
            if (!context.constructor.prototype[name]) {
               Object.defineProperty(context.constructor.prototype, name, { configurable: false, get: () => this[name], set: () => (value) => this[name] = value });
            }
            if (resolve) {
               resolve();
            }
         } else if (priority === 2) {
            this[name] = value;
         } else if (priority === 3) {
            const anonymousFunctionId = anonymousIds.shift();
            if (anonymousFunctionId) {
               if (anonymousFunctionId === name) {
                  resolve(args);
               } else {
                  anonymousIds.unshift(anonymousFunctionId);
               }
            }
         } else {
            if (resolve) {
               resolve(args);
            }
         }
      }, 100);
   }
   dependency() { } //abstract
}

const areAllPublicMembersAsync = ({ context }) => {
   const members = getAllPublicMembersFromPrototype({ context });
   const asyncMembers = members.filter(mi => mi.isAsync);
   return members.length === asyncMembers.length;
}

const wrapMembersFromPrototype = ({ context, stack }) => {
   for (const memberInfo of getAllPublicMembersFromPrototype({ context })) {
      context.constructor.prototype[memberInfo.name] = (args) => {
         return new Promise((resolve) => {
            memberInfo.args = args ? args : {};
            memberInfo.resolve = resolve;
            stack.push({ member: memberInfo, priority: 4 });
         });
      }
   }
}

const getAllPublicMembersFromPrototype = ({ context }) => {
   const memberExlusions = ['dependency', 'constructor'];
   const originalPrototype = originalPrototypes.get(context.constructor.name);
   const properties = originalPrototype.filter(prop => !memberExlusions.find(excl => excl === prop));
   return properties.map((prop) => {
      const member = context.constructor.prototype[prop];
      if (!member) {
         throw new Error('this should not happen');
      }
      return new MemberInfo(prop, member, {}, context, true);
   });
};