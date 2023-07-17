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
      config, callback: ({ parent }) => {
         const isClass = parent.children.find(x => x.name === 'type');
         const isClassArgs = parent.children.find(x => x.name === 'args');
         if (isClass && isClassArgs) {
            const children = parent.children.reduce((children, child) => {
               for (const _child of child.children) {
                  children.push(_child);
               };
               return children;
            }, []);
            for (const child of children) {
               const type = child.value;
               switch (type) {
                  case 'type': {
                     break;
                  }
                  case 'function': {
                     break;
                  }
               }
               if (child.name === "type" && typeof type === 'object') {
                  const types = Object.keys(type)
                     .map(key => type[key])
                     .filter(type => typeof type === 'function');
                  const member = new Member(parent.name, types, , false, null, context);
                  _dependencyMembers.push(member);
               }
            } else if (typeof child.value === 'function') {

            } else {
         }
      }
   });
}

const mapValueTypeMembers = ({ config, context }) => {
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   walkConfig({
      config, callback: ({ parent, child }) => {
         const _child = child;
         let _parent = parent;
         {
            let isClass = _child.name === 'type' || _child.name === 'args' || parent.name === 'type' || parent.name === 'args';
            let isRoot = parent.name === 'root';
            for (const child of _child.children) {
               if (!isClass) {
                  isClass = child.name === 'type' || child.name === 'args';
               }
            }
            if (!isClass && !isRoot) {
               let nodeToAdd = _parent;
               while (nodeToAdd.parent) {
                  if (nodeToAdd.parent.name !== 'root') {
                     nodeToAdd = nodeToAdd.parent;
                  }
               }
               const value = nodeToAdd.children.reduce((obj, child) => {
                  obj[child.name] = child.value;
                  return obj;
               }, {});
               const member = new Member(nodeToAdd.name, null, null, false, value, context);
               _dependencyMembers.push(member);
            }
         }
      }
   });
}

const mapFunctionMembers = ({ config, context }) => {
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   walkConfig({
      config, callback: ({ parent, child }) => {
         if (child.name === 'function') {
            const member = new Member(parent.name, child, null, false, null, context);
            _dependencyMembers.push(member);
         }
         if (child.name === 'args') {
            const member = new Member(parent.name, child, null, false, null, context);
            _dependencyMembers.push(member);
         }
      }
   });
}

const getDependantMembers = ({ context }) => {
   return dependencyMembers.get(context.contextId);
}

const walkConfig = ({ config, callback, currentNode }) => {
   if (!currentNode) {
      currentNode = buildConfigTreeNode({ config });
   }
   for (const child of currentNode.children) {
      callback({
         parent: currentNode,
         child
      });
      walkConfig({ config, callback, currentNode: child });
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
