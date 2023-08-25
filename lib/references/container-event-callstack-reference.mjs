import { ContainerEventCallStack } from "../container-event-callstack.mjs";
import { ContainerReference } from "./container-reference.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { Reference } from "./reference.mjs";
export class ContainerEventCallStackReference extends Reference {
    /**
     * @param {String} name 
     * @param {Object} object 
     * @returns { ContainerEventCallStackReference }
     */
    static create(name, object) {
        const containerEventCallStackReference = new ContainerEventCallStackReference();
        containerEventCallStackReference.Id = Reference.create(name, object, ContainerEventCallStack);
        return containerEventCallStackReference;
    }
    /**
     * @returns { ContainerEventCallStack }
     */
    get containerEventCallStack() {
        return super.object;
    }
    /**
     * @returns { ContainerReference } }
     */
    get containerReference() {
        return super.dependencies(ContainerReference);
    }
    /**
    * @returns { MemberEventReference [] }
    */
    get stack() {
        return super.dependencies(MemberEventReference);
    }
}
