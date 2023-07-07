import utils from "utils";
import vm from "vm";
class MemberInfo {
   constructor(name, member, args) {
      this.name = name;
      this.member = member;
      this.args = args;
   }
}

export class Container {
   constructor() {
      let stack = [];
      if (areAllMembersAsync({ context: this })) {
         wrapMembersFromPrototype({ context: this, stack });
      } else {
         throw new Error(`all members of ${this.constructor.name} must be async`);
      }
      this.dependency = (obj) => {
         for(const key of Object.keys(obj)) {
            if (typeof obj[key] === 'function' && obj[key].toString().replace(/\s+/g,'').startsWith('class')) {
               let name = obj[key].name;
               name = name.charAt(0).toLowerCase() + name.slice(1);
               const constructor = obj[key].constructor;
               const member = new MemberInfo(name, constructor, obj.ctorArgs || {});
               stack.push({ member: memberInfo, priority: 1 });
            }
         }
      }
      setInterval(() => {
         const item = stack stack.shift();
         if (item) {

         }
      }, 1000);
   }
   dependency() { } //abstract
}

const areAllMembersAsync = ({ context }) => {
   return !getAllMembersFromPrototype({ context }).find(mi => !mi.member.toString().replace(/\s+/g,'').startsWith(`async${mi.name}`));
}

const wrapMembersFromPrototype = ({ context, stack }) => {
   for(const memberInfo of getAllMembersFromPrototype({ context })) {
      context.constructor.prototype[memberInfo.name] = (args) => {
         return new Promise((resolve) => {
            memberInfo.args = args;
            memberInfo.resolve = resolve;
            stack.push({ member: memberInfo, priority: 2 });
         });
      }
   }
}

const getAllMembersFromPrototype = ({ context }) => {
   const properties = Object.getOwnPropertyNames(context.constructor.prototype).filter(prop => prop !== 'constructor');
   return properties.map( (prop) => {
      const member = context[prop];
      return new MemberInfo(prop, member);
   });
};