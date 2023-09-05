import { Member } from "../member/member.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberEventStack } from "../stack/member-event-stack.mjs";
const privateBag = new WeakMap();
let memberEventStackRefId;
export class MemberEvent extends Reference {
    /**
    * @param {ReferenceId} memberRefId
    */
    constructor(memberRefId) {
        super(`${memberRefId.name}_event`);
        if (!memberEventStackRefId) {
            const memberEventStack = new MemberEventStack();
            memberEventStackRefId = memberEventStack.Id;
            memberEventStack.raiseEvents();
        }
        super.addReference(memberEventStackRefId, MemberEventStack.prototype);
        super.addReference(memberRefId, Member.prototype);
        privateBag.set(this, {
            error: null,
            data: null
        });
    }
    /**
     * @param {Object} value
     */
    set data(value) {
        privateBag.get(this).data = value;
    }
    /**
     * @return {Object}
     */
    get data() {
        return privateBag.get(this).data;
    }
    /**
     * @param {Error} value
     */
    set error(value) {
        privateBag.get(this).error = value;
    }
    /**
     * @return {Error}
     */
    get error() {
        return privateBag.get(this).error;
    }
}