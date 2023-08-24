import { EventCallStack } from "./event-callstack.mjs";
import { MemberEventCallStack } from "./member-event-callstack.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventCallStackReference extends Reference {
    constructor({ Id, name, object, reference = null, bag = {} }) {
        if (!(object instanceof MemberEventCallStack)) {
            throw new Error(`object is not an instance of ${MemberEventCallStack.name}`);
        }
        super({ Id, name, object, reference, bag });
    }
    /**
     * @returns { MemberEventCallStack }
     */
    get memberEventCallStack() {
        return this.object;
    }
    /**
     * @returns { { memberEventReference: MemberEventReference } }
     */
    references() {
        return Reference.references(this);
    }
    /**
     * @param { Object } context 
     * @returns { MemberEventCallStackReference }
     */
    static reference(context) {
        return Reference.reference(context);
    }
}      