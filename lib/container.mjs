import utils from "utils";

class MemberProperty {
   Id = utils.generateGUID();
   constructor({ member }) {
      if (member.isClass || member.isValueType) {
         Object.defineProperty(member.context, member.name, { configurable: false, 
            get: () => this.func.call(member.context, { member, args: null, value: null }),
            set: (value) => this.func.call(member.context, {member, args: null, value })
         });
      }
      if (member.isPublic) {
         Object.defineProperty(member.context, member.name, { configurable: false, value: async (_args) => {
            await this.AsyncFunc({ member, args: null, value: null });
            return await member.call({ args: _args });
         }});
      }
   }
   AsyncFunc({ args, member, value }) {
      return new Promise((resolve, reject) => {
         try {
           this.func.call(member.context, { args, member, value, resolve });
         } catch(err) {
            reject(err);
         }
      });
   }
   func ({ args, member, value, resolve }) {
      const context = member.context;
      const globalCallstackItem = getGlobalCallstack().shift();
      if (globalCallstackItem.context === context.constructor.name && globalCallstackItem.function === 'func') {
         if (member.isValueType) {
            if (value !== undefined && value !== null) {
               member.value = value;
            }
            return member.value;
         }
         if (member.isPublic) {
            return (async() => {
               for (const dependantMember of member.dependantMembers) {
                  if (dependantMember.isAsync && !dependantMember.isClass) {
                     await dependantMember.call({});
                  }
               }
               resolve();
            })();
         }
         if (member.isClass) {
            let instance = null;
            let Class = dependencyMockMembers.get(member.func.name);
            if (!Class) {
               Class = member.func;
            }
            instance = new Class(member.args);
            console.log(`created new instance of ${instance.contextId}`);
            return instance;
         }
      }
      throw new Error(`Unable to access member: ${member.name}, it is private to: ${member.context.contextId}`);
   }
}

const members = new WeakMap();
class Member {
   constructor(name, func, args, isPublic, value, context) {
      const properties = {};
      if (members.has(this)) {
         properties = members.get(this);
      } else {
         members.set(this, properties);
      }
      
      properties.Id = `${context.contextId}-${name}`.toLowerCase();
      properties.context = context;
      properties.name = name;
      properties.func = func;
      properties.args = args || {};
      properties.isPublic = isPublic;

      const _name = func ? func.name : name;
      const script = func ? func.toString().replace(/\s+/g, '') : '';
      const isAsyncMember = script ? script.startsWith(`async${_name}(`) || script.startsWith(`async(`) || script.indexOf('Promise(') > -1 : false;
      properties.isAsync = isAsyncMember;
      const isClassMember = script ? script.startsWith(`class${_name}extends${Container.name}`) : false;
      properties.isClass = isClassMember;
      const isValueTypeMember = (value !== undefined && value !== null && name) ? true : false;
      properties.isValueType = isValueTypeMember;
      properties.value = value;
      let dependantMembers = [];
      if (isPublic) {
         for (const dependantMember of getDependantMembers({ context }).filter(m => !m.isPublic && m.Id !== this.Id)) {
            dependantMembers.push(dependantMember);
         }
      }
      properties.dependantMembers = dependantMembers;
      new MemberProperty({ member: this });
   }
   get dependantMembers() {
      return members.get(this)["dependantMembers"];
   }
   get isAsync() {
      return members.get(this)["isAsync"];
   }
   get isClass() {
      return members.get(this)["isClass"];
   }
   get isValueType() {
      return members.get(this)["isValueType"];
   }
   get value() {
      return members.get(this)["value"];
   }
   set value(_value) {
      members.get(this)["value"] = _value;
   }
   get isPublic() {
      return members.get(this)["isPublic"];
   }
   get args() {
      return members.get(this)["args"];
   }
   get func() {
      return members.get(this)["func"];
   }
   get name() {
      return members.get(this)["name"];
   }
   get Id() {
      return members.get(this)["Id"];
   }
   get context() {
      return members.get(this)["context"];
   }
   async call({ args }) {
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