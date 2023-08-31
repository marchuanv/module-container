import { Reference } from "../reference/reference.mjs";
const privateBag = new WeakMap();
export class MemberInfo extends Reference {
   /**
    * @param {String} name
    * @param {Function} functions
    * @param {Object} args
    * @param {Boolean} isPublic
    * @param {Object} value
    * @param {Boolean} isFunction
    * @param {Boolean} isProperty
    * @param {Boolean} isClass,
    */
   constructor(name, functions, args, isPublic, value, isFunction, isProperty, isClass) {
      super(name);
      privateBag.set(this, {
         name,
         functions: functions ? (Array.isArray(functions) ? functions : [functions]) : [],
         args,
         isPublic,
         value,
         isFunction,
         isProperty,
         errorHalt: true,
         enabled: true,
         isClass
      });
   }
   get isFunction() {
      const { isFunction } = privateBag.get(this);
      return isFunction;
   }
   get isProperty() {
      const { isProperty } = privateBag.get(this);
      return isProperty;
   }
   get enabled() {
      const { enabled } = privateBag.get(this);
      return enabled;
   }
   set enabled(value) {
      const data = privateBag.get(this);
      data.enabled = value;
   }
   /**
    * @returns { Class }
    */
   get Class() {
      const { functions } = privateBag.get(this);
      return functions[0];
   }
   get isClass() {
      const { isClass } = privateBag.get(this);
      return isClass;
   }
   get isAsync() {
      const { functions } = privateBag.get(this);
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
      const { name, value } = privateBag.get(this);
      return (value !== undefined && value !== null && name) ? true : false;
   }
   get value() {
      const data = privateBag.get(this);
      return data.value;
   }
   set value(value) {
      const data = privateBag.get(this);
      data.value = value;
   }
   set errorHalt(value) {
      const data = privateBag.get(this);
      data.errorHalt = value;
   }
   get errorHalt() {
      const { errorHalt } = privateBag.get(this);
      return errorHalt;
   }
   get isPublic() {
      const { isPublic } = privateBag.get(this);
      return isPublic;
   }
   get args() {
      const { args } = privateBag.get(this);
      return args || {};
   }
   /**
    * @returns { Array<Function> }
    */
   get functions() {
      const { functions } = privateBag.get(this);
      return functions;
   }
   get name() {
      const { name } = privateBag.get(this);
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