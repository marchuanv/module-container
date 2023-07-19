import utils from "utils";
import { Container } from "./container.mjs";
const memberInfoProperties = new WeakMap();
export class MemberInfo {
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
      properties.errorHalt = true;
      properties.errorReturn = null;
      properties.args = args || {};
      properties.isPublic = isPublic;
      properties.enabled = true;
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
   get enabled() {
      return memberInfoProperties.get(this)["enabled"];
   }
   set enabled(value) {
      memberInfoProperties.get(this)["enabled"] = value;
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
   set errorHalt(_value) {
      memberInfoProperties.get(this)["errorHalt"] = _value;
   }
   get errorHalt() {
      return memberInfoProperties.get(this)["errorHalt"];
   }
   set errorReturn(_value) {
      memberInfoProperties.get(this)["errorReturn"] = _value;
   }
   get errorReturn() {
      return memberInfoProperties.get(this)["errorReturn"];
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