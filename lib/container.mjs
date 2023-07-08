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
      let stack = {
         priority1: [],
         priority2: [],
         priority3: [],
         priority4: []
      };
      if (areAllPublicMembersAsync({ context: this })) {
         wrapMembersFromPrototype({ context: this, stack });
      } else {
         throw new Error(`all members of ${this.constructor.name} must be async`);
      }
      this.dependency = (config) => {
         getLockWithRepeat({ name: 'dependency', context: this, callback: () => {
            if (typeof config === 'function') {
               const id = utils.generateGUID();
               anonymousIds.unshift(id);
               const memberInfo = new MemberInfo(id, null, config.ctorArgs, this, false, config, null);
               stack.priority3.push({ member: memberInfo });
            } else {
               for(const memberInfo of getValueMembers({ config, context: this })) {
                  stack.priority2.unshift({ member: memberInfo });
               }
               for(const memberInfo of getClassMembers({ config, context: this })) {
                  stack.priority1.unshift({ member: memberInfo });
               }
            }
         }});
      }
      handleStack({ context: this, stack });
   }
   async dependency() { } //abstract
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
            getLockWithRepeat({ name: 'wrap', context, callback: () => {
               stack.priority4.unshift({ member: memberInfo });
            }});
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

const handleStack = ({ context, stack }) => {
   getLockWithRepeat({ name: 'stack', context, repeatTimeInMil: 2000, callback: async () => {
      if (stack.priority1.length > 0) {
         const stackItem = stack.priority1.shift();
         await handleClassPromises({ stackItem });
         await handleValueTypePromises({ stackItem });
         await handleAnonymousFunctionPromises({ stackItem });
         await handlePublicMemberWrapperPromises({ stackItem });   
      }
      if (stack.priority2.length > 0) {
         const stackItem = stack.priority2.shift();
         await handleClassPromises({ stackItem });
         await handleValueTypePromises({ stackItem });
         await handleAnonymousFunctionPromises({ stackItem });
         await handlePublicMemberWrapperPromises({ stackItem });   
      }
      if (stack.priority3.length > 0) {
         const stackItem = stack.priority3.shift();
         await handleClassPromises({ stackItem });
         await handleValueTypePromises({ stackItem });
         await handleAnonymousFunctionPromises({ stackItem });
         await handlePublicMemberWrapperPromises({ stackItem });   
      }
      if (stack.priority4.length > 0) {
         const stackItem = stack.priority4.shift();
         await handleClassPromises({ stackItem });
         await handleValueTypePromises({ stackItem });
         await handleAnonymousFunctionPromises({ stackItem });
         await handlePublicMemberWrapperPromises({ stackItem });   
      }
   }});
}

const handleClassPromises = async ({ stackItem }) => {
   const { member: { context, name, member, args, isAClass } } = stackItem;
   if (name && member && args && isAClass ) {
      context[name] = new member(args);
      if (!context.constructor.prototype[name]) {
         Object.defineProperty(context.constructor.prototype, name, { 
            configurable: false,
            get: () => context[name], 
            set: () => (value) => context[name] = value
         });
      }
   }
}

const handleValueTypePromises = ({ stackItem }) => {
   const { member: { context, name, value } } = stackItem;
   if (name && value) {
      context[name] = value;
   }
}

const handleAnonymousFunctionPromises = async ({ stackItem }) => {
   const { member: { context, name, args, resolve } } = stackItem;
   if (context && name && resolve ) {
      const anonymousFunctionId = anonymousIds.shift();
      if (anonymousFunctionId) {
         if (anonymousFunctionId === name) {
            try {
               await resolve.call(context, args);
            } catch (error) {
               throw(error);
            }
         } else {
            anonymousIds.unshift(anonymousFunctionId);
         }
      }
   }
}

const handlePublicMemberWrapperPromises = async ({ stackItem }) => {
   const { member: { context, member, args, resolve, reject } } = stackItem;
   if (member && resolve && reject) {
      try {
         const output = await member.call(context, args);
         await resolve(output)
      } catch (error) {
         await reject(error);
      }
   }
}
const tracking = new WeakMap();
const getLockWithRepeat = async ({ name, context, callback, timeInMil = 100, repeatTimeInMil = 0 }) => {
   if (!tracking.has(context)) {
      const Id = utils.generateGUID();
      tracking.set(context, { Id, locked: false, sources: [], timeInMil, origTimeInMil: timeInMil, repeatTimeInMil });
   }
   const track = tracking.get(context);
   track.sources = track.sources.filter(x => x !== name);
   track.sources.push(name);
   if (track.locked) {
      if (track.timeInMil < 300) {
         track.timeInMil = track.timeInMil + 1;
      } else {
         track.timeInMil = track.origTimeInMil;
      }
      setTimeout( async () => {
         await getLockWithRepeat({ name, context, callback });
      }, track.timeInMil);
   } else {
      track.locked = true;
      try {
         await callback.call(context);
      } catch(error) {
         throw(error);
      } finally {
         track.locked = false;
         if (track.repeatTimeInMil) {
            setTimeout( async () => {
               await getLockWithRepeat({ name, context, callback });
            }, track.repeatTimeInMil);
         }
      }
   }
};
