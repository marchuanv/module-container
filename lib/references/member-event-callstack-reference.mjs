import { MemberEventCallStack } from "../member-event-callstack.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventCallStackReference extends Reference {
    constructor({ Id, name, object, references = [] }) {
        super({ Id, name, object, objectClass: MemberEventCallStack, references });
    }
    /**
     * @returns { MemberEventCallStack }
     */
    get memberEventCallStack() {
        return super.object;
    }
    /**
     * @returns { { memberEventReference: MemberEventReference } }
     */
    references() {
        return super.references(this);
    }
    /**
     * @returns { MemberEventCallStackReference }
     */
    static reference() {
        return Reference.reference(MemberEventCallStackReference);
    }
}      