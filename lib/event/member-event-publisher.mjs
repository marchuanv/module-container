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
    publish(data) {
        const thisMemberEvent = super.getReference(MemberEvent.prototype);
        thisMemberEvent.data = data;
        const memberEventStack = thisMemberEvent.getReference(MemberEventStack.prototype);
        memberEventStack.unshift(thisMemberEvent.Id);
        return new Promise((resolve) => {
            memberEventStack.onShift(async (memberEvent) => {
                if (memberEvent.Id === thisMemberEvent.Id) {
                    resolve(memberEvent);
                }
            });
        });
    }
}