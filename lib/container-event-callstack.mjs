import utils from "utils";
import { ContainerEventCallStackReference } from "./references/container-event-callstack-reference.mjs";
import { ContainerReference } from "./container-reference.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";

export class ContainerEventCallStack {
    /**
    * @param {ContainerReference} containerReference
    */
    constructor(containerReference) {
        const Id = utils.generateGUID();
        const name = `${containerReference.name}_event_callstack`;
        ContainerEventCallStackReference.ctor({ Id, name, object: this, references: [containerReference] });
    }
    /**
     * @returns {Boolean}
     */
    isValid = () => {
        const memberEventReference = ContainerEventCallStackReference.reference.stack[0];
        const memberInfo = memberEventReference.memberInfoReference.memberInfo;
        for (const childMemberInfo of memberInfo.children) {
            const found = ContainerEventCallStackReference.reference.stack.find(mer => mer.memberInfoReference.memberInfo.Id === childMemberInfo.Id);
            if (found) {
                return true;
            }
        }
        return false;
    }
    /**
     * @returns {MemberEventReference}
     */
    shift() {
        return ContainerEventCallStackReference.reference.stack.shift();
    }
    /**
    * @param {MemberEventReference} memberEventReference
    */
    unshift(memberEventReference) {
        return ContainerEventCallStackReference.reference.stack.unshift(memberEventReference);
    }
}