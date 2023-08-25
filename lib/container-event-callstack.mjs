import utils from "utils";
import { ContainerEventCallStackReference } from "./container-event-callstack-reference.mjs";
import { ContainerReference } from "./container-reference.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";

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
        const containerEventCallStackReference = ContainerEventCallStackReference.reference(this);
        const { memberEventReference } = containerEventCallStackReference.references();
        const { memberInfoReference } = memberEventReference.references();
        for (const childMemberInfo of memberInfoReference.memberInfo.children) {
            for (const dependency of containerEventCallStackReference.dependencies) {
                {
                    if (dependency instanceof MemberEventReference) {
                        const { memberInfoReference } = dependency.references();
                        if (memberInfoReference.memberInfo.Id === childMemberInfo.Id) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    shift() {
        const containerEventCallStackReference = ContainerEventCallStackReference.reference(this);
        containerEventCallStackReference.references = null;
    }
    /**
    * @param {MemberEventReference} memberEventReference
    */
    unshift(memberEventReference) {
        const containerEventCallStackReference = ContainerEventCallStackReference.reference(this);
        containerEventCallStackReference.references = memberEventReference;
    }
}