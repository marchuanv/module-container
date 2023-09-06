import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberEventStack } from "../stack/member-event-stack.mjs";
import { MemberEvent } from "./member-event.mjs";
export class MemberEventPublisher extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     */
    constructor(memberEventRefId) {
        super(`${memberEventRefId.name}_publisher`);
        super.addReference(memberEventRefId, MemberEvent.prototype);
    }
    /**
     * @param {ReferenceId} memberEventRefId
     * @returns {Promise<MemberEvent>}
     */
    publish(input) {
        const thisMemberEvent = super.getReference(MemberEvent.prototype);
        thisMemberEvent.input = input;
        const memberEventStack = thisMemberEvent.getReference(MemberEventStack.prototype);
        return new Promise(async (resolve) => {
            memberEventStack.onShift(this.Id, thisMemberEvent.Id, true, resolve);
            memberEventStack.unshift(thisMemberEvent.Id);
        });
    }
}