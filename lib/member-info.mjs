import { Container } from "./container.mjs";
import { MemberInfoReference } from "./references/member-info-reference.mjs";
import { ReferenceId } from "./references/referenceId.mjs";
const refs = new WeakMap();
export class MemberInfo extends MemberInfoReference {
   /**
    * @param {String} name
    * @param {Function} func
    * @param {Object} args
    * @param {Boolean} isPublic
    * @param {Object} value
    * @param {Boolean} isFunction
    * @param {Boolean} isProperty
    * @param {Boolean} isCallBeforePublicMember,
    * @param {ReferenceId} containerRefId
    */
   constructor(name, func, args, isPublic, value, isFunction, isProperty, isCallBeforePublicMember, containerRefId) {
      super(name);
      super.dependency = containerRefId;
      const _func = func ? (Array.isArray(func) ? func : [func]) : [];
      const refId = super.setData({
         name,
         func: _func,
         args,
         isPublic,
         value,
         isFunction,
         isProperty,
         isCallBeforePublicMember,
         errorHalt: true,
         enabled: true,
         children: [],
         parent: null
      });
      refs.set(this, refId);
   }
   /**
    * @returns { MemberInfo [] }
    */
   get children() {
      const refId = refs.get(this);
      const { children } = super.getData(refId);
      return children;
   }
   /**
    * @returns { MemberInfo }
    */
   get parent() {
      const refId = refs.get(this);
      const { parent } = super.getData(refId);
      return parent;
   }
   /**
    * @param { MemberInfo }
    */
   set parent(value) {
      const refId = refs.get(this);
      const data = super.getData(refId);
      return data.parent = value;
   }
   get isCallBeforePublicMember() {
      const refId = refs.get(this);
      const { isCallBeforePublicMember } = super.getData(refId);
      return isCallBeforePublicMember;
   }
   get isFunction() {
      const refId = refs.get(this);
      const { isFunction } = super.getData(refId);
      return isFunction;
   }
   get isProperty() {
      const refId = refs.get(this);
      const { isProperty } = super.getData(refId);
      return isProperty;
   }
   get enabled() {
      const refId = refs.get(this);
      const { enabled } = super.getData(refId);
      return enabled;
   }
   set enabled(value) {
      const refId = refs.get(this);
      const data = super.getData(refId);
      data.enabled = value;
   }
   get isAsync() {
      const refId = refs.get(this);
      const { func } = super.getData(refId);
      let isAsyncMember = false;
      for (const _func of func) {
         if (isAsyncMember && !checkIsAsync({ func: _func })) {
            throw new Error('one or more classes in collection is not async');
         }
         isAsyncMember = checkIsAsync({ func: _func });
      }
      return isAsyncMember;
   }
   get isContainerClass() {
      const refId = refs.get(this);
      const { func } = super.getData(refId);
      let isContainerClassMember = false;
      for (const _func of func) {
         if (isContainerClassMember && !checkIsContainerClass({ func: _func })) {
            throw new Error('one or more classes in collection is not async');
         }
         isContainerClassMember = checkIsContainerClass({ func: _func });
      }
      return isContainerClassMember;
   }
   get isClass() {
      let isClassMember = false;
      for (const _func of func) {
         if (isClassMember && !checkIsClass({ func: _func })) {
            throw new Error('one or more classes in collection is not async');
         }
         isClassMember = checkIsClass({ func: _func });
      }
      return isClassMember;
   }
   get isValueType() {
      const refId = refs.get(this);
      const { name, value } = super.getData(refId);
      return checkIsValueType({ name, value });
   }
   get value() {
      const refId = refs.get(this);
      const data = super.getData(refId);
      return data.value;
   }
   set value(value) {
      const refId = refs.get(this);
      const data = super.getData(refId);
      data.value = value;
   }
   set errorHalt(value) {
      const refId = refs.get(this);
      const data = super.getData(refId);
      data.errorHalt = value;
   }
   get errorHalt() {
      const refId = refs.get(this);
      const { errorHalt } = super.getData(refId);
      return errorHalt;
   }
   get isPublic() {
      const refId = refs.get(this);
      const { isPublic } = super.getData(refId);
      return isPublic;
   }
   get args() {
      const refId = refs.get(this);
      const { args } = super.getData(refId);
      return args || {};
   }
   get func() {
      const refId = refs.get(this);
      const { func } = super.getData(refId);
      return func;
   }
   get name() {
      const refId = refs.get(this);
      const { name } = super.getData(refId);
      return name;
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
   return script ? script.startsWith(`class${name.toLowerCase()}`) || script.startsWith(`class`) : false;
}
function checkIsContainerClass({ func }) {
   const script = getScript({ func });
   const name = getFunctionName({ func });
   return script ? script.startsWith(`class${name.toLowerCase()}extends${Container.name.toLowerCase()}`) : false;
}
function checkIsValueType({ name, value }) {
   return (value !== undefined && value !== null && name) ? true : false;
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