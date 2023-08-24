import utils from "utils";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { MemberEventCallstackReference } from "./member-event-callstack-reference.mjs";
import { MemberEventCallStackItem } from "./member-event-callstack-item.mjs";
import { Reference } from "./reference.mjs";
import { MemberEventCallstackItemReference } from "./member-event-callstack-item-reference.mjs";

export class MemberEventCallStack {
    /**
    * @param {MemberInfoReference} memberInfoReference
    */
    constructor(memberInfoReference) {
        const Id = utils.generateGUID();
        const name = `${memberInfoReference.name}_callstack`;
        new MemberEventCallstackReference({
            Id, name, object: this, reference: memberInfoReference, bag: {
                stack: []
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
    shift() {
        memberEventCallstackReference.
    }
    unshift() {
        const stack = Reference.bag(this).stack;
        stack.unshift(new MemberEventCallStackItem(MemberEventCallstackReference.get(this)));
    }
}