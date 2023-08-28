import { MemberInfoReference } from "./references/member-info-reference.mjs";
import { ReferenceId } from "./references/referenceId.mjs";
const refs = new WeakMap();
export class MemberInfo extends MemberInfoReference {
   /**
    * @param {String} name
    * @param {Function} functions
    * @param {Object} args
    * @param {Boolean} isPublic
    * @param {Object} value
    * @param {Boolean} isFunction
    * @param {Boolean} isProperty
    * @param {Boolean} isCallBeforePublicMember,
    * @param {Boolean} isSingleton,
    * @param {Boolean} isClass,
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} memberInfoDepRefId
    */
   constructor(name, functions, args, isPublic, value, isFunction, isProperty, isCallBeforePublicMember, isSingleton, isClass, containerRefId, memberInfoDepRefId) {
      super(name);
      super.dependency = containerRefId;
      super.dependency = memberInfoDepRefId;
      const refId = super.setData({
         name,
         functions: functions ? (Array.isArray(functions) ? functions : [functions]) : [],
         args,
         isPublic,
         value,
         isFunction,
         isProperty,
         isCallBeforePublicMember,
         errorHalt: true,
         enabled: true,
         isSingleton,
         isClass
      });
      refs.set(this, refId);
   }
   get isCallBeforePublicMember() {
      const { isCallBeforePublicMember } = getProperties.call(this);
      return isCallBeforePublicMember;
   }
   get isFunction() {
      const { isFunction } = getProperties.call(this);
      return isFunction;
   }
   get isProperty() {
      const { isProperty } = getProperties.call(this);
      return isProperty;
   }
   get enabled() {
      const { enabled } = getProperties.call(this);
      return enabled;
   }
   set enabled(value) {
      const data = getProperties.call(this);
      data.enabled = value;
   }
   get isSingleton() {
      if (this.isClass) {
         const { isSingleton } = getProperties.call(this);
         return isSingleton;
      }
      return false;
   }
   get isClass() {
      const { isClass } = getProperties.call(this);
      return isClass;
   }
   get isAsync() {
      const { functions } = getProperties.call(this);
      let isAsyncMember = false;
      for (const _func of functions) {
         if (isAsyncMember && !checkIsAsync({ functions: _func })) {
            throw new Error('one or more classes in collection is not async');
         }
         isAsyncMember = checkIsAsync({ functions: _func });
      }
      return isAsyncMember;
   }
   get isValueType() {
      const { name, value } = getProperties.call(this);
      return (value !== undefined && value !== null && name) ? true : false;
   }
   get value() {
      const data = getProperties.call(this);
      return data.value;
   }
   set value(value) {
      const data = getProperties.call(this);
      data.value = value;
   }
   set errorHalt(value) {
      const data = getProperties.call(this);
      data.errorHalt = value;
   }
   get errorHalt() {
      const { errorHalt } = getProperties.call(this);
      return errorHalt;
   }
   get isPublic() {
      const { isPublic } = getProperties.call(this);
      return isPublic;
   }
   get args() {
      const { args } = getProperties.call(this);
      return args || {};
   }
   /**
    * @returns { Array<Function> }
    */
   get functions() {
      const { functions } = getProperties.call(this);
      return functions;
   }
   get name() {
      const { name } = getProperties.call(this);
      return name;
   }
}
function getProperties() {
   const refId = refs.get(this);
   return super.getData(refId);
}
function getScript({ functions }) {
   return functions ? functions.toString().toLowerCase().replace(/\s+/g, '') : '';
}
function checkIsAsync({ functions }) {
   const script = getScript({ functions });
   const name = getFunctionName({ functions });
   return script ? script.startsWith(`async${name.toLowerCase()}(`) ||
      script.startsWith(`async(`) ||
      script.indexOf('returnnewpromise(') > -1 : false;
}
function getFunctionName({ functions }) {
   if (!functions) {
      throw new Error('functions is null or undefined.');
   }
   const type = typeof functions;
   if (!(type === 'function')) {
      throw new Error(`functions is of type: ${type}`);
   }
   const _name = functions.name;
   if (!_name) {
      throw new Error(`unable to determine function name`);
   }
   return _name;
}
function isClass(v) {
   if (typeof v !== 'function') {
      return false;
   }
   try {
      v();
      return false;
   } catch (error) {
      if (/^Class constructor/.test(error.message)) {
         return true;
      }
      return false;
   }
}