import utils from "utils";

const configTemplateProperties = new WeakMap();
class ConfigTemplate {
   constructor({ name }) {
      configTemplateProperties.delete(this);
      const templates = {
         type: {
            type: null,
            args: null
         },
         func: {
            args: null,
            callback: {
               func: null
            }
         },
         valueType: {
            name: null,
            value: null
         }
      };
      const template = Object.keys(templates)
                        .filter(key => key === name)
                        .map(key => templates[key])[0];
      if (!template) {
         throw new Error('could not locate template');
      }
      this.id = name;
      configTemplateProperties.set(this, template);
   }
   match({ object , template }) {
      if (!object) {
         throw new Error('invalid match argument: object');
      }
      if (!template) {
         template = JSON.parse(JSON.stringify(configTemplateProperties.get(this)));
      }
      for(const key of Object.keys(template)) {
         const value = object[key];
         if (value === undefined) {
            return false;
         }
         if (template[key] && typeof template[key] === 'object') {
            const match = this.match({ object:  object[key], template: template[key] });
            if (!match) {
               return false;
            }
         }
      }
      return true;
   }
}

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

      if (properties.func && !Array.isArray(properties.func)) {
         properties.func = [properties.func];
         for (const _func of properties.func) {
            if (isAsyncMember && !checkIsAsync({ func: _func })) {
               throw new Error('one or more classes in collection is not async');
            }
            isAsyncMember = checkIsAsync({ func: _func });
            if (isClassMember && !checkIsClass({ func: _func })) {
               throw new Error('one or more classes in collection is not async');
            }
            isClassMember = checkIsClass({ func: _func });
            if (isContainerClassMember && !checkIsContainerClass({ func: _func })) {
               throw new Error('one or more classes in collection is not async');
            }
            isContainerClassMember = checkIsContainerClass({ func: _func });
         }
      } else {
         properties.func = () => { };
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
      for(const func of this.func) {
         return await func.call(this.context, args);
      }
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
      mapPublicMembersFromPrototype({ context });
      if (areAllPublicMembersAsync({ context })) {
         mapValueTypeMembers({ config, context });
         mapClassMembers({ config, context });
         mapFunctionMembers({ config, context });
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
   const configTemplate = new ConfigTemplate({ name: 'type' });
   getConfig({ config, configTemplate, callback: ({ name, type, args }) => {
      const member = new Member(name, type, args, false, null, context);
      _dependencyMembers.push(member);
   }});
}

const mapValueTypeMembers = ({ config, context }) => {
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   const configTemplate = new ConfigTemplate({ name: 'valueType' });
   getConfig({ config, configTemplate, callback: ({ name, value }) => {
      const member = new Member(name, null, null, false, value, context);
      _dependencyMembers.push(member);
   }});
}

const mapFunctionMembers = ({ config, context }) => {
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   const configTemplate = new ConfigTemplate({ name: 'func' });
   getConfig({ config, configTemplate, callback: ({ name, func, args }) => {
      const member = new Member(name, func, args, false, null, context);
      _dependencyMembers.push(member);
   }});
}

const getConfig = ({ config, configTemplate, callback }) => {
   walkConfigTree({ config, callback: ({ name, value, children }) => {
      switch(configTemplate.id) {
         case 'type': {
            if (configTemplate.match({ object: value || {} })) {
               const argsNode = children.find(x => x.name === 'args');
               const typeNode = children.find(x => x.name === 'type');
               const types = typeNode.children.reduce( (types, item)  => {
                  if (!Array.isArray(item.value) && typeof item.value === 'object') {
                     for(const type of Object.keys(item.value)) {
                        types.push(item.value[type]);
                     }
                  } else if(typeof item.value === 'function') {
                     types.push(item.value);
                  }
                  return types;
               },[]);
               callback({ name, type: types, args: argsNode.value });
            }
            break;
         }
         case 'func': {
            if (configTemplate.match({ object: value || {} })) {
               const argsNode = children.find(x => x.name === 'args');
               const callbackNode = children.find(x => x.name === 'callback');
               const func = callbackNode.value['func'];
               callback({ name, func, args: argsNode.value });
            }
            break;
         }
         case 'valueType': {
            if (configTemplate.match({ object: value || {} })) {
               const nameNode = children.find(x => x.name === 'name');
               const valueNode = children.find(x => x.name === 'value');
               callback({
                  name: nameNode.value,
                  value: valueNode.value
               });
            }
            break;
         }
         default: {
            throw new Error('unable to determine configuration template');
         }
      }
   }});
};

const getDependantMembers = ({ context }) => {
   return dependencyMembers.get(context.contextId);
}

const walkConfigTree = ({ config, callback, currentNode, track = [] }) => {
   if (!currentNode) {
      currentNode = buildConfigTreeNode({ config });
   }
   if (!track.find(id => id === currentNode.id)) {
      track.push(currentNode.id);
      callback(currentNode);
   }
   for (const child of currentNode.children) {
      walkConfigTree({ config, callback, currentNode: child, track });
   }
}

const buildConfigTreeNode = ({ config, transformedConfig, parentNode }) => {
   if (!parentNode) {
      transformedConfig = getConfigWithTemplateRefs({ config });
      const ids = Object.keys(transformedConfig);
      const rootId = ids.find(id => transformedConfig[id].name === 'root');
      const rootConfig = transformedConfig[rootId];
      parentNode = {
         id: rootConfig.id,
         name: rootConfig.name,
         value: null,
         children: []
      };
   }
   const ids = Object.keys(transformedConfig);
   for (const id of ids) {
      const config = transformedConfig[id];
      if (parentNode.id === config.ref) {
         const node = buildConfigTreeNode({
            config,
            transformedConfig,
            parentNode: {
               name: config.name,
               id: config.id,
               value: config.value,
               children: []
            }
         });
         parentNode.children.push(node);
      }
   }
   return parentNode;
}

const getConfigWithTemplateRefs = ({ config, template, rootRef, priority = 1 }) => {
   const transformedConfig = {};
   if (!template) {
      template = createOrderedKeyTemplate({ config });
      const rootId = utils.generateGUID();
      const root = { id: rootId, name: 'root', ref: null, priority };
      priority = priority + 1;
      transformedConfig[rootId] = root;
      rootRef = rootId;
   }
   for (const key of Object.keys(template)) {
      const _key = key;
      {
         let { key, ref, id } = template[_key];
         const value = config[key];
         if (value) {
            if (!ref) {
               ref = rootRef;
            }
            transformedConfig[_key] = { id, name: key, value, ref, priority };
            if (typeof value === 'object') {
               priority = priority + 1;
               const _config = getConfigWithTemplateRefs({ config: value, template, rootRef, priority });
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
         dictionary[ref] = { id: ref, key: _key, ref: _ref };
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
   return _name;
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
