import utils from "utils";
import { MemberEventCallstackReference } from "./member-event-callstack-reference.mjs";
import { MemberEventCallstackItemReference } from "./member-event-callstack-item-reference.mjs";
export class MemberEventCallStackItem {
    /**
    * @param {MemberEventCallstackReference} memberEventCallstackReference
    */
    constructor(memberEventCallstackReference) {
        const Id = utils.generateGUID();
        const name = `${memberEventCallstackReference.name}_item`;
        new MemberEventCallstackItemReference({ Id, name, object: this, reference: memberEventCallstackReference });
    }
}
