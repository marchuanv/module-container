import { ContainerEventCallStack } from "../container-event-callstack.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { Reference } from "./reference.mjs";
export class ContainerEventCallStackReference extends Reference {
    constructor({ Id, name, object, references = [] }) {
        super({ Id, name, object, objectClass: ContainerEventCallStack, references });
    }
    /**
     * @returns { ContainerEventCallStack }
     */
    get containerEventCallStack() {
        return super.object;
    }
    /**
     * @returns { { containerReference: ContainerReference, memberEventReference: MemberEventReference } }
     */
    references() {
        return super.references();
    }
    /**
     * @returns { ContainerEventCallStackReference }
     */
    static reference() {
        return Reference.reference(ContainerEventCallStackReference);
    }

}      