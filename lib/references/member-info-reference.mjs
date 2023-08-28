import { Container } from "../container.mjs";
import { MemberInfo } from "../member-info.mjs";
import { Reference } from "./reference.mjs";
export class MemberInfoReference extends Reference {
   /**
    * @param {String} name
    */
   constructor(name) {
      super(name, this, MemberInfo);
   }
   /**
    * @returns { Array<MemberInfo> }
    */
   get membersInfo() {
      return super.dependencies(MemberInfo);
   }
   /**
    * @returns { Container }
    */
   get container() {
      return super.dependencies(Container);
   }
}