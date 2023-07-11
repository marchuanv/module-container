import utils from "utils";

class Member {
   constructor(name, func, args, isPublic, value, context) {
      this.Id = `${context.contextId}-${name}`.toLowerCase();
      this.context = context;
      this.name = name;
      this.func = func;
      this.args = args || {};
      this.isPublic = isPublic;
      const _name = func ? func.name : name;
      let script = this.func ? this.func.toString().replace(/\s+/g, '') : '';
      this.isAsyncMember = script ? script.startsWith(`async${_name}(`) || script.startsWith(`async(`) || script.indexOf('Promise(') > -1 : false;
      this.isClassMember = script ? script.startsWith(`class${_name}extends${Container.name}`) : false;
      this.isValueTypeMember = (value !== undefined && value !== null && name) ? true : false;
      this.value = value;

      if (this.isPublic) {
         context.constructor.prototype[this.name] = async (_args) => {
            return await this.call({ context, args: _args });
         }
      }

      if (this.isClassMember) {
         Object.defineProperty(this.context, this.name, {
            configurable: false, 
            get: () => {
               let instance = null;
               const fakeClass = dependencyMockMembers.get(this.func.name);
               if (fakeClass) {
                  instance = new fakeClass(this.args);
                  console.log(`${fakeClass.name}(${instance.contextId}) created`);
               } else {
                  instance = new this.func(this.args);
               }
               const globalCallstackItem = getGlobalCallstack().shift();
               if (globalCallstackItem.context === this.context.constructor.name && globalCallstackItem.function === 'get') {
                  return instance;
               }
               throw new Error(`Unable to access member: ${this.name}, it is private to: ${this.context.contextId}`);
            }
         });
      }
      if (this.isValueTypeMember) {
         Object.defineProperty(this.context, this.name, {
            configurable: false,
            get: () => {
               const globalCallstackItem = getGlobalCallstack().shift();
               if (globalCallstackItem.context === this.context.constructor.name && globalCallstackItem.function === 'get') {
                  return this.value;
               }
               throw new Error(`Unable to access member: ${this.name}, it is private to: ${this.context.contextId}`);
            }, set: (value) => {
               this.value = value;
            }
         });
      }
      this.dependantMembers = [];
      if (this.isPublic) {
         this.dependantMembers = getDependantMembers({ context });
         for (const dependantMember of this.dependantMembers.filter(d => d.isClass || d.isPublic)) {
            this.dependantMembers = this.dependantMembers.filter(d => d.Id !== dependantMember.Id);
         }
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
   async call({ args }) {
      for (const dependantMember of this.dependantMembers) {
         await dependantMember.call({ args });
      }
      return await this.func.call(this.context, args);
   }
}
const dependencyMembers = new Map();
const dependencyMockMembers = new Map();
const originalPrototypes = new Map();
export class Container {
   constructor(config) {
      const context = this;
      const contextPrototype = context.constructor.prototype;
      this.contextId = `${context.constructor.name}(${utils.generateGUID()})`;
      dependencyMembers.set(this.contextId, []);
      if (context.constructor.name === Container.name) {
         throw new Error('Container is an abstract class');
      }
      if (!originalPrototypes.has(this.contextId)) {
         originalPrototypes.set(this.contextId, Object.getOwnPropertyNames(contextPrototype));
      }
      if (areAllPublicMembersAsync({ context })) {
         mapValueTypeMembers({ config, context });
         mapClassMembers({ config, context });
         mapFunctionMembers({ config, context });
         mapPublicMembersFromPrototype({ context });
      } else {
         throw new Error(`all members of ${context.constructor.name} must be async`);
      }
   }
   async mock({ Class, FakeClass }) {
      dependencyMockMembers.delete(Class.name);
      dependencyMockMembers.set(Class.name, FakeClass);
   }
}

const areAllPublicMembersAsync = ({ context }) => {
   const members = getDependantMembers({ context });
   const asyncMembers = members.filter(mi => mi.isAsync);
   return members.length === asyncMembers.length;
}

const mapPublicMembersFromPrototype = ({ context }) => {
   const memberExlusions = ['dependency', 'constructor'];
   const originalPrototype = originalPrototypes.get(context.contextId);
   const properties = originalPrototype.filter(prop => !memberExlusions.find(excl => excl === prop));
   const members = properties.map((prop) => {
      const member = context.constructor.prototype[prop];
      if (!member) {
         throw new Error('this should not happen');
      }
      return new Member(prop, member, {}, true, null, context);
   });
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   for (const member of members) {
      _dependencyMembers.push(member);
   }
};

const mapClassMembers = ({ config, context }) => {
   const members = Object.keys(config).reduce((items, key) => {
      const childConfig = config[key];
      if (typeof childConfig === 'object') {
         const keys = Object.keys(childConfig);
         const Class = keys.filter(key2 => childConfig[key2] && childConfig[key2].name && getTypeName({ Class: childConfig[key2] }) === key).map(key => childConfig[key])[0]
         if (childConfig.ctorArgs && Class) {
            const member = new Member(key, Class, childConfig.ctorArgs, false, null, context);
            items.push(member);
         }
      }
      return items;
   }, []);
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   for (const member of members) {
      _dependencyMembers.push(member);
   }
}

const mapValueTypeMembers = ({ config, context }) => {
   const members = Object.keys(config).reduce((items, key) => {
      const value = config[key];
      if (!value.ctorArgs) {
         const member = new Member(key, () => {}, null, false, value, context);
         items.push(member);
      }
      return items;
   }, []);
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   for (const member of members) {
      _dependencyMembers.push(member);
   }
}

const mapFunctionMembers = ({ config, context }) => {
   const members = Object.keys(config).reduce((items, key) => {
      const childConfig = config[key];
      if (typeof childConfig === 'function') {
         const member = new Member(key, childConfig, null, false, null, context);
         items.push(member);
      }
      return items;
   }, []);
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   for (const member of members) {
      _dependencyMembers.push(member);
   }
}

const getTypeName = function ({ Class }) {
   let name = Class.name;
   name = name.charAt(0).toLowerCase() + name.slice(1);
   return name;
}

const getDependantMembers = ({ context }) => {
   return dependencyMembers.get(context.contextId);
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