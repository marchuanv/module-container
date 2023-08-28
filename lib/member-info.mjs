import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
const refs = new WeakMap();
export class MemberInfo extends Reference {
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
      if (containerRefId) {
         this.dependency = containerRefId;
      }
      if (memberInfoDepRefId) {
         this.dependency = memberInfoDepRefId;
      }
      this.data.name = name;
      this.data.functions = functions ? (Array.isArray(functions) ? functions : [functions]) : [];
      this.data.args = args;
      this.data.isPublic = isPublic;
      this.data.value = value;
      this.data.isFunction = isFunction;
      this.data.isProperty = isProperty;
      this.data.isCallBeforePublicMember = isCallBeforePublicMember;
      this.data.errorHalt = true;
      this.data.enabled = true;
      this.data.isSingleton = isSingleton;
      this.data.isClass = isClass;
   }
   get isCallBeforePublicMember() {
      const { isCallBeforePublicMember } = this.data;
      return isCallBeforePublicMember;
   }
   get isFunction() {
      const { isFunction } = this.data;
      return isFunction;
   }
   get isProperty() {
      const { isProperty } = this.data;
      return isProperty;
   }
   get enabled() {
      const { enabled } = this.data;
      return enabled;
   }
   set enabled(value) {
      const data = this.data;
      data.enabled = value;
   }
   get isSingleton() {
      if (this.isClass) {
         const { isSingleton } = this.data;
         return isSingleton;
      }
      return false;
   }
   /**
    * @returns { Class }
    */
   get Class() {
      const { functions } = this.data;
      return functions[0];
   }
   get isClass() {
      const { isClass } = this.data;
      return isClass;
   }
   get isAsync() {
      const { functions } = this.data;
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
      const { name, value } = this.data;
      return (value !== undefined && value !== null && name) ? true : false;
   }
   get value() {
      const data = this.data;
      return data.value;
   }
   set value(value) {
      const data = this.data;
      data.value = value;
   }
   set errorHalt(value) {
      const data = this.data;
      data.errorHalt = value;
   }
   get errorHalt() {
      const { errorHalt } = this.data;
      return errorHalt;
   }
   get isPublic() {
      const { isPublic } = this.data;
      return isPublic;
   }
   get args() {
      const { args } = this.data;
      return args || {};
   }
   /**
    * @returns { Array<Function> }
    */
   get functions() {
      const { functions } = this.data;
      return functions;
   }
   get name() {
      const { name } = this.data;
      return name;
   }
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