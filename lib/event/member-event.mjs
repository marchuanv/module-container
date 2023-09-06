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
        }
        super.addReference(memberEventStackRefId, MemberEventStack.prototype);
        super.addReference(memberRefId, Member.prototype);
        privateBag.set(this, {
            error: null,
            input: null,
            output: null
        });
    }
    /**
     * @param {Object} value
     */
    set input(value) {
        privateBag.get(this).input = value;
    }
    /**
     * @return {Object}
     */
    get input() {
        return privateBag.get(this).input;
    }
    /**
     * @param {Object} value
     */
    set output(value) {
        privateBag.get(this).output = value;
    }
    /**
     * @return {Object}
     */
    get output() {
        return privateBag.get(this).output;
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