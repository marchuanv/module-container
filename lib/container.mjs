import utils from "utils";

class MemberInfo {
   constructor(name, ctor, args, context, isPublic, resolve, value) {
      this.name = name;
      this.member = ctor || resolve;
      this.args = args || {};
      this.context = context;
      this.isPublic = isPublic;
      const _name = ctor ? ctor.name : name;
      if (this.member) {
         const script = this.member.toString().replace(/\s+/g, '');
         this.asyncProp = script.startsWith(`async${_name}(`) || script.startsWith(`async(`);
         this.isClass = script.startsWith(`class${_name}`);
         this.promiseProp = script.indexOf('Promise(') > -1;
      }
      this.resolve = resolve;
      this.value = value;
   }
   get isAsync() {
      return this.asyncProp || this.promiseProp;
   }
   get isAClass() {
      return this.isClass;
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
      this.dependency = (config) => {
         if (lock) {
            return setTimeout(() => this.dependency(config), 100);
         }
         lock = true;
         if (typeof config === 'function') {
            const id = utils.generateGUID();
            anonymousIds.unshift(id);
            const memberInfo = new MemberInfo(id, null, config.ctorArgs, this, false, config, null);
            stack.push({ member: memberInfo, priority: 3 });
         } else {
            for(const memberInfo of getClassMembers({ config, context: this })) {
               stack.push({ member: memberInfo, priority: 1 });
            }
            for(const memberInfo of getValueMembers({ config, context: this })) {
               stack.push({ member: memberInfo, priority: 2 });
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
         const { member: { context, name, member, args, resolve, value, isAClass, reject }, priority } = stack.shift();
         if (name && member && args && isAClass && priority === 1) {
            context[name] = new member(args);
            if (!context.constructor.prototype[name]) {
               Object.defineProperty(context.constructor.prototype, name, { 
                  configurable: false,
                  get: () => context[name], 
                  set: () => (value) => context[name] = value
               });
            }
         }
         if (name && value && priority === 2) {
            context[name] = value;
         } 
         if (priority === 3) {
            const anonymousFunctionId = anonymousIds.shift();
            if (anonymousFunctionId) {
               if (anonymousFunctionId === name) {
                  try {
                     await resolve(args);
                  } catch (error) {
                     console.log('error occured in promise queue: ', error);
                  }
               } else {
                  anonymousIds.unshift(anonymousFunctionId);
               }
            }
         } 
         if (member && resolve && reject && priority === 4) {
            try {
               const output = await member.call(context, args);
               await resolve(output)
            } catch (error) {
               reject(error);
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
         return new Promise((resolve, reject) => {
            memberInfo.args = args ? args : {};
            memberInfo.resolve = resolve;
            memberInfo.reject = reject;
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

const getClassMembers = ({ config, context }) => {
   return Object.keys(config).reduce((items, key) => {
      const childConfig = config[key];
      if(typeof childConfig === 'object') {
         const keys = Object.keys(childConfig);
         const Class = keys.filter(key2 => childConfig[key2] && childConfig[key2].name && getTypeName({ Class: childConfig[key2] }) === key).map(key => childConfig[key])[0]
         if(childConfig.ctorArgs && Class) {
            const member = new MemberInfo(key, Class, childConfig.ctorArgs, context, false, null, null);
            items.push(member);
         }
      }
      return items;
   },[]);
}

const getValueMembers = ({ config, context }) => {
   return Object.keys(config).reduce((items, key) => {
      const value = config[key];
      if (!value.ctorArgs) {
         const member = new MemberInfo(key, null, null, context, false, null, value);
         items.push(member);
      }
      return items;
   },[]);
}

const getTypeName = function ({ Class }) {
   let name = Class.name;
   name = name.charAt(0).toLowerCase() + name.slice(1);
   return name;
}


