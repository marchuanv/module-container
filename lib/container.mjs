import utils from "utils";

class ContainerMemberCallStackItem {
   /**
    * 
    * @param {Member} member 
    */
   constructor(member) {
      this.context = member.context;
      this.name = member.name;
      this.Id = member.Id;
   }
}

const containerMemberCallStack = new Map();
class ContainerMemberCallStack {
   constructor(contextName) {
      this.context = contextName;
      if (!containerMemberCallStack.has(this.context)) {
         containerMemberCallStack.set(this.context, []);
      }
   }
   /**
   * @param {ContainerMemberCallStackItem} member 
   */
   add(member) {
      if (!(member instanceof ContainerMemberCallStackItem)) {
         throw new Error(`member is not an instance of ${ContainerMemberCallStackItem.name}`);
      }
      this.stack.unshift(member);
   }
   get stack() {
      return containerMemberCallStack.get(this.context);
   }
}

class Member {
   constructor(name, ctor, args, isPublic, resolve, value, context) {
      this.Id = utils.generateGUID();
      this.name = name;
      this.member = ctor || resolve || (() => console.log('ctor or resolve arguments was not provided.'));
      this.args = args || {};
      this.isPublic = isPublic;
      const _name = ctor ? ctor.name : name;
      let script = this.member ? this.member.toString().replace(/\s+/g, ''): '';
      this.isAsyncMember = script ? script.startsWith(`async${_name}(`) || script.startsWith(`async(`) || script.indexOf('Promise(') > -1 : false;
      this.isClassMember = script ? script.startsWith(`class${_name}`) : false;
      this.isValueTypeMember = value && name ? true : false;
      this.resolve = resolve;
      this.value = value;

      if (this.isClassMember || this.isValueTypeMember) {
         Object.defineProperty(context, name, {configurable: false,
            get: function() {
               const stack = member.stack;
   
   
   
               // const _stack = (new Error()).stack.split("\n");
               // const caller = _stack[2].trim().split(" ")[1];
               // if (caller !== 'new') {
               //    const callerSeg = caller.split('.');
               //    const callingFuncName = callerSeg[callerSeg.length - 1];
               //    const actualClassName = contextPrototype.constructor.name;
               //    const existsOnPrototype = Object.getOwnPropertyNames(contextPrototype).find(p => p === callingFuncName) !== undefined;
               //    let isAanonymousWrappedFunction = false;
               //    if (!existsOnPrototype && callingFuncName === '<anonymous>') {
               //       isAanonymousWrappedFunction = true;
               //    }
               //    if ((!existsOnPrototype && !isAanonymousWrappedFunction) || caller !== `${actualClassName}.${callingFuncName}`) {
               //       throw new Error(`Unable to access property: ${name}, it is private to: ${contextPrototype.constructor.name}`);
               //    }
               // }
               return member.instance;
            }
         });
      }
   
   }
  
   get isAsync() {
      return this.isAsyncMember;
   }
   get isClass() {
      return this.isClassMember;
   }
   get isValueType() {
      return this.isValueTypeMember;
   }
   async call({ context, args }) {
      if (args) {
         this.args = args;
      }
      if (this.isClass) {
         this.instance = new this.member(this.args);
        
         return;
      }
      if (this.isValueType) {
         this.instance = this.value;
         return;
      }
      this.add(new ContainerMemberCallStackItem(this));
      return await this.member.call(context, this.args);
   }
}
const anonymousIds = [];
const dependencyMembers = new WeakMap();
const originalPrototypes = new Map();
export class Container {
   constructor() {
      const context = this;
      if (context.constructor.name === Container.name) {
         throw new Error('Container is an abstract class');
      }
      if (!originalPrototypes.has(context.constructor.name)) {
         originalPrototypes.set(context.constructor.name, Object.getOwnPropertyNames(context.constructor.prototype));
      }
      if (areAllPublicMembersAsync({ context })) {
         wrapMembersFromPrototype({ context });
      } else {
         throw new Error(`all members of ${context.constructor.name} must be async`);
      }
      context.dependency = (config) => {
         if (typeof config === 'function') {
            const id = utils.generateGUID();
            anonymousIds.unshift(id);
            const member = new Member(id, null, config.ctorArgs, false, config, null, context);
            mapDependencyMembers({ context, member });
         } else {
            for (const member of getValueTypeMembers({ config, context })) {
               mapDependencyMembers({ context, member });
            }
            for (const member of getClassMembers({ config, context })) {
               mapDependencyMembers({ context, member });
            }
         }
      }
   }
   async dependency(config) { } //abstract
}

const areAllPublicMembersAsync = ({ context }) => {
   const members = getAllPublicMembersFromPrototype({ context });
   const asyncMembers = members.filter(mi => mi.isAsync);
   return members.length === asyncMembers.length;
}

const wrapMembersFromPrototype = ({ context }) => {
   for (const wrappedMMember of getAllPublicMembersFromPrototype({ context })) {
      const contextPrototype = context.constructor.prototype;
      contextPrototype[wrappedMMember.name] = async (args) => {
         for (const member of getDependencyMembers({ context })) {
            await member.call({ context });
         }
         return await wrappedMMember.call({ context, args });
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
      return new Member(prop, member, {}, true, null, null, context);
   });
};

const getClassMembers = ({ config, context }) => {
   return Object.keys(config).reduce((items, key) => {
      const childConfig = config[key];
      if (typeof childConfig === 'object') {
         const keys = Object.keys(childConfig);
         const Class = keys.filter(key2 => childConfig[key2] && childConfig[key2].name && getTypeName({ Class: childConfig[key2] }) === key).map(key => childConfig[key])[0]
         if (childConfig.ctorArgs && Class) {
            const member = new Member(key, Class, childConfig.ctorArgs, false, null, null, context);
            items.push(member);
         }
      }
      return items;
   }, []);
}

const getValueTypeMembers = ({ config, context }) => {
   return Object.keys(config).reduce((items, key) => {
      const value = config[key];
      if (!value.ctorArgs) {
         const member = new Member(key, null, null, false, null, value, context);
         items.push(member);
      }
      return items;
   }, []);
}

const getTypeName = function ({ Class }) {
   let name = Class.name;
   name = name.charAt(0).toLowerCase() + name.slice(1);
   return name;
}

const mapDependencyMembers = ({ member, context }) => {
   if (dependencyMembers.has(context)) {
      const _dependencyMembers = dependencyMembers.get(context);
      _dependencyMembers.push(member);
   } else {
      dependencyMembers.set(context, [member]);
   }
}

const getDependencyMembers = ({ context }) => {
   return dependencyMembers.get(context);
}