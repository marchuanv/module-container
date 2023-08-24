import utils from "utils";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { ContainerEventCallStackReference } from "./container-event-callstack-reference.mjs";
import { Reference } from "./reference.mjs";
import { ContainerReference } from "./container-reference.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { MemberEventCallStackReference } from "./member-event-callstack-reference.mjs";

export class ContainerEventCallStack {
    /**
    * @param {ContainerReference} containerReference
    */
    constructor(containerReference) {
        const Id = utils.generateGUID();
        const name = `${containerReference.name}_event_callstack`;
        const reference = new ContainerEventCallStackReference({ Id, name, object: this });
        reference.dependency = containerReference;
    }
    isValid = () => {
        for(const eventCallStackItemReference of EventCallStackItemReference.references(this)) {
            const { memberEventReference } = eventCallStackItemReference.references();
            const { memberInfoReference } = memberEventReference.references();
            memberInfoReference.memberInfo;
        }
    }
    shift() {
        for(const eventCallStackItemReference of EventCallStackItemReference.references(this)) {
            const { memberEventReference } = eventCallStackItemReference.references();
            const { memberInfoReference } = memberEventReference.references();
            memberInfoReference.memberInfo;
        }
    }
    /**
    * @param {MemberEventReference} memberEventReference
    */
    unshift(memberEventReference) {
        const { memberEventCallStackReference } = memberEventReference.references();
        const containerEventCallStackReference = ContainerEventCallStackReference.reference(this);
        containerEventCallStackReference.dependency = memberEventCallStackReference;
    }
}