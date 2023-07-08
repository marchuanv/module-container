import utils from "utils";

class MemberInfo {
   constructor(name, ctor, args, isPublic, resolve, value) {
      this.name = name;
      this.member = ctor || resolve || (() => console.log('ctor or resolve arguments was not provided.'));
      this.args = args || {};
      this.isPublic = isPublic;
      const _name = ctor ? ctor.name : name;
      if (this.member) {
         const script = this.member.toString().replace(/\s+/g, '');
         this.isAsyncMember = script.startsWith(`async${_name}(`) || script.startsWith(`async(`);
         this.isClassMember = script.startsWith(`class${_name}`);
         if (!this.isAsyncMember) {
            this.isAsyncMember = script.indexOf('Promise(') > -1;
         }
      }
      this.isValueTypeMember = value && name;
      this.resolve = resolve;
      this.value = value;
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
            const member = new MemberInfo(id, null, config.ctorArgs, false, config, null);
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
   for (const wrappedMmemberInfo of getAllPublicMembersFromPrototype({ context })) {
      const contextPrototype = context.constructor.prototype;
      contextPrototype[wrappedMmemberInfo.name] = async (args) => {
         for (const member of getDependencyMembers({ context })) {
            const { name, isClass, isValueType } = member;
            if (isClass || isValueType) {
               if (!contextPrototype[name]) {
                  Object.defineProperty(contextPrototype, name, {
                     configurable: false,
                     get: () => {
                        const stack = (new Error()).stack.split("\n");
                        const caller = stack[2].trim().split(" ")[1];
                        if (caller !== 'new') {
                           const callerSeg = caller.split('.');
                           const callingFuncName = callerSeg[callerSeg.length - 1];
                           const actualClassName = contextPrototype.constructor.name;
                           const existsOnPrototype = Object.getOwnPropertyNames(contextPrototype).find(p => p === callingFuncName) !== undefined;
                           let isAanonymousWrappedFunction = false;
                           if (!existsOnPrototype && callingFuncName === '<anonymous>') {
                              isAanonymousWrappedFunction = true;
                           }
                           if ((!existsOnPrototype && !isAanonymousWrappedFunction) || caller !== `${actualClassName}.${callingFuncName}`) {
                              throw new Error(`Unable to access property: ${name}, it is private to: ${contextPrototype.constructor.name}`);
                           }
                        }
                        return member.instance;
                     }
                  });
               }
            }
            await member.call({ context });
         }
         return await wrappedMmemberInfo.call({ context, args });
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
      return new MemberInfo(prop, member, {}, true);
   });
};

const getClassMembers = ({ config }) => {
   return Object.keys(config).reduce((items, key) => {
      const childConfig = config[key];
      if (typeof childConfig === 'object') {
         const keys = Object.keys(childConfig);
         const Class = keys.filter(key2 => childConfig[key2] && childConfig[key2].name && getTypeName({ Class: childConfig[key2] }) === key).map(key => childConfig[key])[0]
         if (childConfig.ctorArgs && Class) {
            const member = new MemberInfo(key, Class, childConfig.ctorArgs, false, null, null);
            items.push(member);
         }
      }
      return items;
   }, []);
}

const getValueTypeMembers = ({ config }) => {
   return Object.keys(config).reduce((items, key) => {
      const value = config[key];
      if (!value.ctorArgs) {
         const member = new MemberInfo(key, null, null, false, null, value);
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
