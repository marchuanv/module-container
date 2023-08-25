import { MemberEventCallStack } from "../member-event-callstack.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventCallStackReference extends Reference {
    /**
    * @param {String} name 
    */
    constructor(name) {
        super(name, this, MemberEventCallStack);
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