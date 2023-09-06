import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberEventStack } from "../stack/member-event-stack.mjs";
import { MemberEvent } from "./member-event.mjs";
export class MemberEventSubscription extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     */
    constructor(memberEventRefId) {
        super(`${memberEventRefId.name}_subscription`);
        super.addReference(memberEventRefId, MemberEvent.prototype);
    }
    /**
     * @param { Promise<MemberEvent> } callback
     */
    async subscribe(callback) {
        const thisMemberEvent = super.getReference(MemberEvent.prototype);
        const memberEventStack = thisMemberEvent.getReference(MemberEventStack.prototype);
        memberEventStack.onShift(this.Id, thisMemberEvent.Id, false, callback);
    }
}