import { MemberEventQueue } from "./member-event-queue.mjs";
import { MemberEvent } from "./member-event.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class MemberEventPublisher extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} memberEventQueueRefId
     */
    constructor(memberEventRefId, memberEventQueueRefId) {
        super(`${memberEventRefId.name}_publisher`);
        this.dependency = memberEventRefId;
        this.dependency = memberEventQueueRefId;
    }
    /**
     * @param { Object } data
     */
    async publish(data) {
        const memberEvent = this.get(MemberEvent.prototype);
        const memberEventQueue = this.get(MemberEventQueue.prototype);
        memberEventQueue.push(memberEvent.Id);
    }
}