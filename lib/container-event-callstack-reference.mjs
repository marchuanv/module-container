import { ContainerEventCallStack } from "./container-event-callstack.mjs";
import { MemberEventCallStackReference } from "./member-event-callstack-reference.mjs";
import { Reference } from "./reference.mjs";
export class ContainerEventCallStackReference extends Reference {
    constructor({ Id, name, object, reference = null, bag = {} }) {
        if (!(object instanceof ContainerEventCallStack)) {
            throw new Error(`object is not an instance of ${ContainerEventCallStack.name}`);
        }
        super({ Id, name, object, reference, bag });
    }
    /**
     * @returns { ContainerEventCallStack }
     */
    get containerEventCallStack() {
        return this.object;
    }
    /**
     * @returns { { containerReference: ContainerReference, memberEventCallStackReference: MemberEventCallStackReference } }
     */
    references() {
        return Reference.references(this);
    }
    /**
     * @param {Object} context 
     * @returns { ContainerEventCallStackReference }
     */
    static reference(context) {
        return Reference.reference(context);
    }
}      