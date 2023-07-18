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

class Member {
   constructor({ memberInfo, context }) {
      this.Id = utils.generateGUID();
      if (memberInfo.isClass || memberInfo.isContainerClass || memberInfo.isValueType) {
         Object.defineProperty(context, memberInfo.name, {
            configurable: false,
            get: () => this.property.call(context, { memberInfo, args: null, value: null }),
            set: (value) => this.property.call(context, { memberInfo, args: null, value })
         });
      } else if (memberInfo.isPublic) {
         Object.defineProperty(context, memberInfo.name, {
            configurable: false, value: async (_args) => {
               const stack = stackContext.get(context);
               stack.unshift({ context: context.constructor.name, function: memberInfo.name });
               await this.resolveDependencies.call(context, { memberInfo });
               for (const func of memberInfo.func) {
                  return await func.call(context, _args);
               }
            }
         });
      } else {
         Object.defineProperty(context, memberInfo.name, {
            configurable: false, value: async (_args) => {
               for (const func of memberInfo.func) {
                  return await func.call(context, _args);
               }
            }
         });
      }
   }
   async resolveDependencies({ memberInfo }, timeoutMill = 10) {
      const context = this;
      return new Promise((resolve, reject) => {
         setTimeout(async () => {
            try {
               if (contextLock.has(context)) {
                  try {
                     await resolveDependencies.call(context, { memberInfo }, timeoutMill + 10);
                  } catch (error) {
                     console.log(error);
                  }
               } else {
                  contextLock.set(context, true);
                  if (memberInfo.isPublic) {
                     for (const dependantMember of getMembersInfo({ context }).filter(m => !m.isPublic && m.Id !== memberInfo.Id)) {
                        if (dependantMember.isAsync && !dependantMember.isClass && !dependantMember.isContainerClass) {
                           await context[dependantMember.name].call(context, dependantMember.args);
                        }
                     }
                  }
                  resolve();
               }
            } catch (error) {
               reject(error);
            } finally {
               contextLock.delete(context);
            }
         }, timeoutMill);
      });
   }
   property({ memberInfo, value }) {
      const context = this;
      const stack = stackContext.get(context);
      const stackItem = stack[0];
      let isValidStackCall = false;
      if (stackItem && stackItem.context === context.constructor.name) {
         isValidStackCall = true;
      }
      if (!isValidStackCall) {
         throw new Error(`Unable to access member: ${memberInfo.name}, it is private to: ${context.contextId}`);
      }
      if (memberInfo.isValueType) {
         if (value !== undefined && value !== null) {
            memberInfo.value = value;
         }
         return memberInfo.value;
      }
      if (memberInfo.isClass || memberInfo.isContainerClass) {
         let instances = [];
         if (!Array.isArray(memberInfo.func)) {
            memberInfo.func = [memberInfo.func];
         }
         for (const Class of memberInfo.func) {
            if (typeof Class === 'function') {
               try {
                  const instance = new Class(memberInfo.args);
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

class MemberInfo {
   constructor(name, func, args, isPublic, value) {
      const properties = {};
      if (memberInfoProperties.has(this)) {
         properties = memberInfoProperties.get(this);
      } else {
         memberInfoProperties.set(this, properties);
      }
      properties.Id = utils.generateGUID();
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

   }
   get Id() {
      return memberInfoProperties.get(this)["Id"];
   }
   get isAsync() {
      return memberInfoProperties.get(this)["isAsync"];
   }
   get isContainerClass() {
      return memberInfoProperties.get(this)["isContainerClass"];
   }
   get isClass() {
      return memberInfoProperties.get(this)["isClass"];
   }
   get isValueType() {
      return memberInfoProperties.get(this)["isValueType"];
   }
   get value() {
      return memberInfoProperties.get(this)["value"];
   }
   set value(_value) {
      memberInfoProperties.get(this)["value"] = _value;
   }
   get isPublic() {
      return memberInfoProperties.get(this)["isPublic"];
   }
   get args() {
      return memberInfoProperties.get(this)["args"];
   }
   get func() {
      return memberInfoProperties.get(this)["func"];
   }
   get name() {
      return memberInfoProperties.get(this)["name"];
   }
   get Id() {
      return memberInfoProperties.get(this)["Id"];
   }
}

const membersInfo = new Map();
const originalPrototypes = new Map();
const stackContext = new WeakMap;
const memberInfoProperties = new WeakMap();
const contextLock = new WeakMap();

export class Container {
   constructor(config) {
      const context = this;
      const contextPrototype = context.constructor.prototype;
      this.contextId = `${context.constructor.name}(${utils.generateGUID()})`;
      membersInfo.set(this.contextId, []);
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
         for (const memberInfo of membersInfo.get(context.contextId)) {
            new Member({ memberInfo, context });
         }
      } else {
         throw new Error(`all members of ${context.constructor.name} must be async`);
      }
      Object.freeze(this);
   }
}

const areAllPublicMembersAsync = ({ context }) => {
   const _membersInfo = getMembersInfo({ context });
   const asyncMembers = _membersInfo.filter(mi => mi.isAsync);
   return _membersInfo.length === asyncMembers.length;
}

const mapPublicMembersFromPrototype = ({ context }) => {
   const memberExlusions = ['dependency', 'constructor'];
   const originalPrototype = originalPrototypes.get(context.contextId);
   const properties = originalPrototype.filter(prop => !memberExlusions.find(excl => excl === prop));
   const newMembersInfo = properties.map((prop) => {
      const member = context.constructor.prototype[prop];
      if (!member) {
         throw new Error('this should not happen');
      }
      return new MemberInfo(prop, member, {}, true, null, context);
   });
   for (const newMemberInfo of newMembersInfo) {
      membersInfo.get(context.contextId).push(newMemberInfo);
   }
};

const mapClassMembers = ({ config, context }) => {
   membersInfo.get(context.contextId)
   const configTemplate = new ConfigTemplate({ name: 'type' });
   getConfig({
      config, configTemplate, callback: ({ name, type, args }) => {
         const memberInfo = new MemberInfo(name, type, args, false, null, context);
         membersInfo.get(context.contextId).push(memberInfo);
      }
   });
}

const mapValueTypeMembers = ({ config, context }) => {
   const configTemplate = new ConfigTemplate({ name: 'valueType' });
   getConfig({
      config, configTemplate, callback: ({ name, value }) => {
         const memberInfo = new MemberInfo(name, null, null, false, value, context);
         membersInfo.get(context.contextId).push(memberInfo);
      }
   });
}

const mapFunctionMembers = ({ config, context }) => {
   const configTemplate = new ConfigTemplate({ name: 'func' });
   getConfig({
      config, configTemplate, callback: ({ name, func, args }) => {
         const memberInfo = new MemberInfo(name, func, args, false, null, context);
         membersInfo.get(context.contextId).push(memberInfo);
      }
   });
}

const mapMockedMembers = ({ config, context }) => {
   const configTemplate = new ConfigTemplate({ name: 'mock' });
   getConfig({
      config, configTemplate, callback: ({ name, type, typeFake, args }) => {
         for (let i = 0; i < membersInfo.get(context.contextId).length; i++) {
            const dependencyMember = membersInfo.get(context.contextId)[i];
            if (dependencyMember.isClass && dependencyMember.isContainerClass &&
               dependencyMember.func.find(f => type.find(x => x.name === f.name))) {
               {
                  const { name } = membersInfo.get(context.contextId).splice(i, 1)[0];
                  const memberInfo = new MemberInfo(name, typeFake, args, false, null, context);
                  membersInfo.get(context.contextId).push(memberInfo);
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

const getMembersInfo = ({ context }) => {
   return membersInfo.get(context.contextId);
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
