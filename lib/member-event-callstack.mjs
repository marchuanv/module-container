import utils from "utils";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { MemberEventCallstackReference } from "./member-event-callstack-reference.mjs";

export class MemberEventCallStackItem {
    /**
    * @param {MemberInfoReference} memberInfoReference
    */
    constructor(memberInfoReference) {
        const Id = utils.generateGUID();
        const name = `${memberInfoReference.name}_callstack`;
        new MemberEventCallstackReference({
            Id, name, object: this,
            reference: {
                memberInfoReference,
            }
        });
    }
    isValidCallstack = () => {
        const current = getCallstack(0);
        for (const child of current.memberInfo.children) {
            if (getCallstack().find(cs => cs.memberInfo.Id === child.Id)) {
                return true;
            }
        }
        return false;
    }
    getCallstack = (index = -1) => {
        if (index > -1) {
            return references.get(callstackId)[index];
        } else {
            return references.get(callstackId);
        }
    }
}
export class MemberEventCallStack {
    /**
    * @param {MemberInfoReference} memberInfoReference
    */
    constructor(memberInfoReference) {
        const Id = utils.generateGUID();
        const name = `${memberInfoReference.name}_callstack`;
        new MemberEventCallstackReference({ Id, name, object: this, reference: memberInfoReference });
    }
    isValidCallstack = () => {
        const current = getCallstack(0);
        for (const child of current.memberInfo.children) {
            if (getCallstack().find(cs => cs.memberInfo.Id === child.Id)) {
                return true;
            }
        }
        return false;
    }
    getCallstack = (index = -1) => {
        if (index > -1) {
            return references.get(callstackId)[index];
        } else {
            return references.get(callstackId);
        }
    }
}