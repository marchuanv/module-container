import { Member } from "../member/member.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberEventStack } from "../stack/member-event-stack.mjs";
const privateBag = new WeakMap();
let memberEventStackRefId;
export class MemberEvent extends Reference {
    /**
    * @param {ReferenceId} memberRefId
    * @param {ReferenceId} memberEventStackRefId
    */
    constructor(memberRefId) {
        super(`${memberRefId.name}_event`);
        super.addReference(memberRefId, Member.prototype);
        if (!memberEventStackRefId) {
            const memberEventStack = new MemberEventStack();
            memberEventStackRefId = memberEventStack.Id;
            memberEventStack.raiseEvents();
        }
        super.addReference(memberEventStackRefId, MemberEventStack.prototype);
    }
    /**
     * @param {Object} value
     */
    set data(value) {
        privateBag.set(this, value);
    }
    /**
     * @return {Object}
     */
    get data() {
        return privateBag.get(this);
    }

}