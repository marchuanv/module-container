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
         },
         mock: {
            type: null,
            typeFake: null,
            args: null
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
   match({ object, template }) {
      if (!object) {
         throw new Error('invalid match argument: object');
      }
      if (!template) {
         template = JSON.parse(JSON.stringify(configTemplateProperties.get(this)));
      }
      const templateKeys = Object.keys(template);
      const objectKeys = Object.keys(object);
      if (templateKeys.length !== objectKeys.length) {
         return false;
      }
      for (const key of templateKeys) {
         const value = object[key];
         if (value === undefined) {
            return false;
         }
         if (template[key] && typeof template[key] === 'object') {
            const match = this.match({ object: object[key], template: template[key] });
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
   property({ member, value }) {
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
         let instances = [];
         if (!Array.isArray(member.func)) {
            member.func = [member.func];
         }
         for (const Class of member.func) {
            if (typeof Class === 'function') {
               try {
                  const instance = new Class(member.args);
                  instances.push(instance);
                  console.log(`created new instance of ${instance.contextId}`);
               } catch (error) {
                  console.error(error);
               }
            } else {
               throw new Error('member is not a class');
            }
         }
         if (instances.length <= 1) {
            return instances[0];
         }
         return instances;
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

      if (properties.func) {
         if (!Array.isArray(properties.func)) {
            properties.func = [properties.func];
         }
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
      for (const func of this.func) {
         return await func.call(this.context, args);
      }
   }
}
const dependencyMembers = new Map();
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
         mapMockedMembers({ config, context });
         const _dependencyMembers = dependencyMembers.get(context.contextId);
         for (const dependencyMember of _dependencyMembers) {
            new MemberProperty({ member: dependencyMember });
         }
      } else {
         throw new Error(`all members of ${context.constructor.name} must be async`);
      }
      Object.freeze(this);
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
   getConfig({
      config, configTemplate, callback: ({ name, type, args }) => {
         const member = new Member(name, type, args, false, null, context);
         _dependencyMembers.push(member);
      }
   });
}

const mapValueTypeMembers = ({ config, context }) => {
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   const configTemplate = new ConfigTemplate({ name: 'valueType' });
   getConfig({
      config, configTemplate, callback: ({ name, value }) => {
         const member = new Member(name, null, null, false, value, context);
         _dependencyMembers.push(member);
      }
   });
}

const mapFunctionMembers = ({ config, context }) => {
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   const configTemplate = new ConfigTemplate({ name: 'func' });
   getConfig({
      config, configTemplate, callback: ({ name, func, args }) => {
         const member = new Member(name, func, args, false, null, context);
         _dependencyMembers.push(member);
      }
   });
}

const mapMockedMembers = ({ config, context }) => {
   const _dependencyMembers = dependencyMembers.get(context.contextId);
   const configTemplate = new ConfigTemplate({ name: 'mock' });
   getConfig({
      config, configTemplate, callback: ({ name, type, typeFake, args }) => {
         for (let i = 0; i < _dependencyMembers.length; i++) {
            const dependencyMember = _dependencyMembers[i];
            if (dependencyMember.isClass && dependencyMember.isContainerClass &&
               dependencyMember.func.find(f => type.find(x => x.name === f.name))) {
               {
                  const { name } = _dependencyMembers.splice(i, 1)[0];
                  const member = new Member(name, typeFake, args, false, null, context);
                  _dependencyMembers.push(member);
               }
            }
         }
      }
   });
}

const getConfig = ({ config, configTemplate, callback }) => {
   walkConfigTree({
      config, callback: ({ id, name, value, children }) => {
         switch (configTemplate.id) {
            case 'type': {
               if (configTemplate.match({ object: value || {} })) {
                  const argsNode = children.find(x => x.name === 'args');
                  const typeNode = children.find(x => x.name === 'type');
                  if (argsNode && typeNode) {
                     const types = Object.keys(typeNode.value).map(key => typeNode.value[key]);
                     callback({ name, type: types, args: argsNode.value });
                  } else {
                     console.error(new Error('error getting class config'));
                  }
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
                  if (nameNode && valueNode) {
                     callback({ name: nameNode.value, value: valueNode.value });
                  } else {
                     console.error(new Error('error getting valueType config'));
                  }
               }
               break;
            }
            case 'mock': {
               if (configTemplate.match({ object: value || {} })) {
                  const typeNode = children.find(x => x.name === 'type');
                  const typeFakeNode = children.find(x => x.name === 'typeFake');
                  const argsNode = children.find(x => x.name === 'args');
                  if (typeNode && typeFakeNode && argsNode) {
                     const types = Object.keys(typeNode.value).map(key => typeNode.value[key]);
                     const typesFake = Object.keys(typeFakeNode.value).map(key => typeFakeNode.value[key]);
                     callback({ name, type: types, typeFake: typesFake, args: argsNode.value });
                  } else {
                     console.error(new Error('error getting class config'));
                  }
               }
               break;
            }
            default: {
               throw new Error('unable to determine configuration template');
            }
         }
      }
   });
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

const buildConfigTreeNode = ({ config, node }) => {
   if (!node) {
      node = {
         id: utils.generateGUID(),
         name: 'root',
         value: null,
         children: []
      };
   }
   if (typeof config === 'object') {
      for (const name of Object.keys(config)) {
         const value = config[name];
         const id = utils.generateGUID();
         if (typeof value !== 'function') {
            const childNode = buildConfigTreeNode({
               config: value,
               node: { id, name, value, children: [] }
            });
            node.children.push(childNode);
         }
      }
   }
   return node;
}

function getFunctionName({ func }) {
   if (!func) {
      throw new Error('func is null or undefined.');
   }
   const type = typeof func;
   if (!(type === 'function')) {
      throw new Error(`func is of type: ${type}`);
   }
   const _name = func.name;
   if (!_name) {
      throw new Error(`unable to determine function name`);
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
