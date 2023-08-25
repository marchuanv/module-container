import { MemberEventCallStack } from "../member-event-callstack.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventCallStackReference extends Reference {
    /**
    * @param {String} name 
    * @param {Object} object 
    * @returns { MemberEventCallStackReference }
    */
    static create(name, object) {
        const memberEventCallStackReference = new MemberEventCallStackReference();
        memberEventCallStackReference.Id = Reference.create(name, object, MemberEventCallStack);
        return memberEventCallStackReference;
    }
    /**
     * @returns { MemberEventCallStack }
     */
    get memberEventCallStack() {
        return super.object;
    }
    /**
     * @returns { MemberEventReference }
     */
    get memberEventReference() {
        return super.dependencies(MemberEventReference);
    }
    /**
     * @returns { MemberEventCallStackReference }
     */
    static get reference() {
        return Reference.dependencies(MemberEventCallStackReference);
    }
}      