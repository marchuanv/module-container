import utils from "utils";

class Member {
   constructor(name, ctor, args, isPublic, resolve, value, context) {
      this.name = name;
      this.func = ctor || resolve || (() => console.log('ctor or resolve configuration was not provided.'));
      this.args = args || {};
      this.isPublic = isPublic;
      const _name = ctor ? ctor.name : name;
      let script = this.func ? this.func.toString().replace(/\s+/g, '') : '';
      this.isAsyncMember = script ? script.startsWith(`async${_name}(`) || script.startsWith(`async(`) || script.indexOf('Promise(') > -1 : false;
      this.isClassMember = script ? script.startsWith(`class${_name}`) : false;
      this.isValueTypeMember = value && name ? true : false;
      this.value = value;
      if (this.isClassMember || this.isValueTypeMember) {
         if (this.isClassMember) {
            const fakeClass = dependencyMockMembers.get(this.func);
            if (fakeClass) {
               this.func = fakeClass;
            }
         }
         Object.defineProperty(context, name, {
            configurable: false,
            get: () => {
               const globalCallstackItem = getGlobalCallstack().shift();
               if (globalCallstackItem.context === context.constructor.name && globalCallstackItem.function === 'get') {
                  return this.instance;
               }
               throw new Error(`Unable to access member: ${this.name}, it is private to: ${this.callstack.context}`);
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
         this.instance = new this.func(this.args);
         return;
      }
      if (this.isValueType) {
         this.instance = this.value;
         return;
      }
      return await this.func.call(context, this.args);
   }
}
const dependencyMembers = new WeakMap();
const dependencyMockMembers = new WeakMap();
const originalPrototypes = new Map();
export class Container {
   constructor(config) {
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
      for (const member of getValueTypeMembers({ config, context })) {
         mapDependencyMembers({ context, member });
      }
      for (const member of getClassMembers({ config, context })) {
         mapDependencyMembers({ context, member });
      }
      for (const member of getFunctionMembers({ config, context })) {
         mapDependencyMembers({ context, member });
      }
   }
   async mock({ Class, FakeClass }) {
      dependencyMockMembers.delete(Class);
      dependencyMockMembers.set(Class, FakeClass);
   }
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

const getFunctionMembers = ({ config, context }) => {
   return Object.keys(config).reduce((items, key) => {
      const childConfig = config[key];
      if (typeof childConfig === 'function') {
         const member = new Member(key, null, null, false, childConfig, null, context);
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

const getGlobalCallstack = function () {
   let callstackItemMatch = /at\s+[a-zA-Z0-9]+\.[a-zA-Z0-9]+\s+\(/g;
   const globalCallstack = [];
   let callstackItem = callstackItemMatch.exec((new Error()).stack);
   while (callstackItem && callstackItem[0]) {
      globalCallstack.push(callstackItem[0].replace(/at /g, '').replace(/\s+\(/g, ''));
      callstackItem = callstackItemMatch.exec((new Error()).stack);
   }
   return globalCallstack.map((stackItem) => {
      const splitStackItem = stackItem.split('.');
      return { context: splitStackItem[0], function: splitStackItem[1] };
   });
}