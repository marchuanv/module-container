import utils from "utils";

class MemberProperty {
   constructor({ member }) {
      this.Id = utils.generateGUID();
      if (member.isClass || member.isContainerClass || member.isValueType) {
         Object.defineProperty(member.context, member.name, {
            configurable: false,
            get: () => this.property.call(member.context, { member, args: null, value: null }),
            set: (value) => this.property.call(member.context, { member, args: null, value })
         });
      }
      if (member.isPublic) {
         Object.defineProperty(member.context, member.name, {
            configurable: false, value: async (_args) => {
               const stack = stackContext.get(member.context);
               stack.unshift({ context: member.context.constructor.name, function: member.name });
               await this.resolveDependencies({ member });
               return await member.call({ args: _args });
            }
         });
      }
   }
   async resolveDependencies({ member }, timeoutMill = 10) {
      return new Promise((resolve, reject) => {
         setTimeout(async () => {
            try {
               if (contextLock.has(member.context)) {
                  try {
                     await resolveDependencies({ member }, timeoutMill + 10);
                  } catch (error) {
                     console.log(error);
                  }
               } else {
                  contextLock.set(member.context, true);
                  for (const dependantMember of member.dependantMembers) {
                     if (dependantMember.isAsync && !dependantMember.isClass && !dependantMember.isContainerClass) {
                        await dependantMember.call({});
                     }
                  }
                  resolve();
               }
            } catch (error) {
               reject(error);
            } finally {
               contextLock.delete(member.context);
            }
         }, timeoutMill);
      });
   }
   property({ args, member, value }) {
      const context = member.context;
      const stack = stackContext.get(context);
      const stackItem = stack[0];
      let isValidStackCall = false;
      if (stackItem && stackItem.context === context.constructor.name) {
         isValidStackCall = true;
      }
      if (!isValidStackCall) {
         throw new Error(`Unable to access member: ${member.name}, it is private to: ${member.context.contextId}`);
      }
      if (member.isValueType) {
         if (value !== undefined && value !== null) {
            member.value = value;
         }
         return member.value;
      }
      if (member.isClass || member.isContainerClass) {
         let instance = null;
         if (!Array.isArray(member.func)) {
            member.func = [member.func];
         }
         for (const func of member.func) {
            if (typeof member.func === 'function') {
               let Class = dependencyMockMembers.get(func.name);
               if (!Class) {
                  Class = func;
               }
               instance = new Class(args);
               console.log(`created new instance of ${instance.contextId}`);
            } else {
               throw new Error('member is not a class');
            }
         }
         return instance;
      }
   }
}

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

      let isAsyncMember = false;
      let isClassMember = false;
      let isContainerClassMember = false;
      let isValueTypeMember = false;

      for (const _func of func) {
         if (isAsyncMember && !checkIsAsync({ func })) {
            throw new Error('one or more classes in collection is not async');
         }
         isAsyncMember = checkIsAsync({ func });
         if (isClassMember && !checkIsClass({ func })) {
            throw new Error('one or more classes in collection is not async');
         }
         isClassMember = checkIsClass({ func });
         if (isContainerClassMember && !checkIsContainerClass({ func })) {
            throw new Error('one or more classes in collection is not async');
         }
         isContainerClassMember = checkIsContainerClass({ func });
      }

      isValueTypeMember = checkIsValueType({ name, value });

      properties.isAsync = isAsyncMember;
      properties.isClass = isClassMember;
      properties.isContainerClass = isContainerClassMember;
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
   get isContainerClass() {
      return members.get(this)["isContainerClass"];
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
const stackContext = new WeakMap;
const members = new WeakMap();
const contextLock = new WeakMap();

export class Container {
   constructor(config) {
      const context = this;
      const contextPrototype = context.constructor.prototype;
      this.contextId = `${context.constructor.name}(${utils.generateGUID()})`;
      dependencyMembers.set(this.contextId, []);
      stackContext.set(context, []);
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
      Object.freeze(this);
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
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   walkConfig({
      config, callback: ({ parent, child }) => {
         if (child.name === 'type') {
            if (parent.args) {
               throw new Error('type configuration must have constructir config');
            }
            if (typeof child.value === 'function') {
               const member = new Member(parent.name, child.value, parent.args, false, null, context);
               _dependencyMembers.push(member);
            }
            if (typeof child.value === 'object') {
               const typeKeys = Object.keys(child.value).filter(key => typeof child.value[key] === 'function');
               if (typeKeys.length) {
                  const classes = [];
                  for (const typeKey of typeKeys) {
                     classes.push(child.value[typeKey]);
                  }
                  const member = new Member(parent.name, classes, parent.args, false, null, context);
                  _dependencyMembers.push(member);
               }
            }
         }
      }
   });
}

const mapValueTypeMembers = ({ config, context }) => {
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   walkConfig({
      config, callback: ({ parent, child }) => {
         let name = parent.name;
         let value = parent.value;
         if (typeof value === 'object') {

         }
         name = child.name;
         value = child.value;
         if (child.name !== 'type' && parent.args && typeof value !== 'function') {
         }
         const member = new Member(name, () => { }, null, false, value, context);
         _dependencyMembers.push(member);
      }
   });
}

const mapFunctionMembers = ({ config, context }) => {
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   walkConfig({
      config, callback: ({ parent, child }) => {
         if (typeof child.value === 'function') {
            const member = new Member(key, func, null, false, null, context);
            _dependencyMembers.push(member);
         }
      }
   });
}

const getDependantMembers = ({ context }) => {
   return dependencyMembers.get(context.contextId);
}

const walkConfig = ({ config, callback }) => {
   const transformedConfig = getConfigWithTemplateRefs({ config });
   const keys = Object.keys(transformedConfig);
   for (const ref1 of keys) {
      for (const key2 of keys) {
         const ref2 = transformedConfig[key2].ref;
         if (ref1 === ref2) {
            callback({ parent: transformedConfig[ref2], child: transformedConfig[key2] });
         }
      }
   }
}

const getConfigWithTemplateRefs = ({ config, template }) => {
   if (!template) {
      template = createOrderedKeyTemplate({ config });
   }
   const transformedConfig = {};
   for (const key of Object.keys(template)) {
      const _key = key;
      {
         const { key, ref } = template[_key];
         const value = config[key];
         if (value) {
            transformedConfig[_key] = { name: key, value, ref };
            if (typeof value === 'object') {
               const _config = getConfigWithTemplateRefs({ config: value, template });
               for (const key of Object.keys(_config)) {
                  const configItem = _config[key];
                  transformedConfig[key] = configItem;
               }
            }
         }
      }
   }
   return transformedConfig;
}

const createOrderedKeyTemplate = ({ config, template, ref }) => {
   if (!template) {
      template = JSON.parse(JSON.stringify(config));
   }
   return Object.keys(template).reduce((dictionary, key) => {
      const _key = key;
      const _value = template[_key];
      const _ref = ref;
      {
         const ref = utils.generateGUID();
         dictionary[ref] = { key: _key, ref: _ref };
         {
            if (_value && typeof _value === 'object' && Object.keys(_value).length > 0) {
               const _dictionary = createOrderedKeyTemplate({ config, template: _value, ref });
               const _keys = Object.keys(_dictionary);
               {
                  if (_keys.length > 0) {
                     {
                        for (const _key of _keys) {
                           const _value = _dictionary[_key];
                           dictionary[_key] = _value;
                        }
                     }
                  }
               }
            }
         }
      }
      return dictionary;
   }, {});
}

function getFunctionName({ func }) {
   const _name = func.name;
   if (!_name) {
      throw new Error('unable to determine function name.');
   }
}

function getScript({ func }) {
   return func ? func.toString().toLowerCase().replace(/\s+/g, '') : '';
}

function checkIsAsync({ func }) {
   const script = getScript({ func });
   const name = getFunctionName({ func });
   return script ? script.startsWith(`async${name.toLowerCase()}(`) ||
      script.startsWith(`async(`) ||
      script.indexOf('returnnewpromise(') > -1 : false;
}

function checkIsClass({ func }) {
   const script = getScript({ func });
   const name = getFunctionName({ func });
   return script ? script.startsWith(`class${name.toLowerCase()}`) : false;
}

function checkIsContainerClass({ func }) {
   const script = getScript({ func });
   const name = getFunctionName({ func });
   return script ? script.startsWith(`class${name.toLowerCase()}extends${Container.name.toLowerCase()}`) : false;
}

function checkIsValueType({ name, value }) {
   return (value !== undefined && value !== null && name) ? true : false;
}
