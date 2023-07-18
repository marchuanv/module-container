import utils from "utils";
import { ConfigTemplate } from "./config-template.mjs";
import { MemberInfo } from "./member-info.mjs";
import { Member } from "./member.mjs";

const membersInfo = new Map();
const originalPrototypes = new Map();

export class Container {
   constructor(config) {
      const context = this;
      const contextPrototype = context.constructor.prototype;
      this.contextId = `${context.constructor.name}(${utils.generateGUID()})`;
      membersInfo.set(this.contextId, []);
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
         mapBehaviourForMembers({ config, context });
         for (const memberInfo of getMembersInfo( { context })) {
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
      getMembersInfo({ context }).push(newMemberInfo);
   }
};

const mapClassMembers = ({ config, context }) => {
   const configTemplate = new ConfigTemplate({ name: 'type' });
   getConfig({
      config, configTemplate, callback: ({ name, type, args }) => {
         const memberInfo = new MemberInfo(name, type, args, false, null, context);
         getMembersInfo({ context }).push(memberInfo);
      }
   });
}

const mapValueTypeMembers = ({ config, context }) => {
   const configTemplate = new ConfigTemplate({ name: 'valueType' });
   getConfig({
      config, configTemplate, callback: ({ name, value }) => {
         const memberInfo = new MemberInfo(name, null, null, false, value, context);
         getMembersInfo({ context }).push(memberInfo);
      }
   });
}

const mapFunctionMembers = ({ config, context }) => {
   const configTemplate = new ConfigTemplate({ name: 'func' });
   getConfig({
      config, configTemplate, callback: ({ name, func, args }) => {
         const memberInfo = new MemberInfo(name, func, args, false, null, context);
         getMembersInfo({ context }).push(memberInfo);
      }
   });
}

const mapMockedMembers = ({ config, context }) => {
   const configTemplate = new ConfigTemplate({ name: 'mock' });
   getConfig({
      config, configTemplate, callback: ({ name, type, typeFake, args }) => {
         for (let i = 0; i < getMembersInfo({ context }).length; i++) {
            const dependencyMember = getMembersInfo({ context })[i];
            if (dependencyMember.isClass && dependencyMember.isContainerClass &&
               dependencyMember.func.find(f => type.find(x => x.name === f.name))) {
               {
                  const { name } = getMembersInfo({ context }).splice(i, 1)[0];
                  const memberInfo = new MemberInfo(name, typeFake, args, false, null, context);
                  getMembersInfo({ context }).push(memberInfo);
               }
            }
         }
      }
   });
}

const mapBehaviourForMembers = ({ config, context }) => {
   const configTemplate = new ConfigTemplate({ name: 'behaviour' });
   getConfig({
      config, configTemplate, callback: ({ func, returnValue }) => {
         for (let i = 0; i < getMembersInfo({ context }).length; i++) {
            const memberInfo = getMembersInfo({ context })[i];
            const isMatch = func.find(name => name === memberInfo.name);
            if (isMatch && returnValue !== undefined) {
               memberInfo.errorReturn = returnValue;
               memberInfo.errorHalt = false;
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
            case 'behaviour': {
               if (configTemplate.match({ object: value || {} })) {
                  const errorsNode = children.find(x => x.name === 'errors');
                  const func = errorsNode.value.func;
                  const returnValue = errorsNode.value.return;
                  callback({ func, returnValue });
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
   if (config && typeof config === 'object') {
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