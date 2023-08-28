import { MemberEventQueue } from "./member-event-queue.mjs";
import { MemberEvent } from "./member-event.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class MemberEventSubscription extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} memberEventQueueRefId
     */
    constructor(memberEventRefId, memberEventQueueRefId) {
        super(`${memberEventRefId.name}_subscription`);
        this.dependency = memberEventRefId;
        this.dependency = memberEventQueueRefId;
    }
    /**
     * @param { Promise<Object> } callback
     */
    async subscribe(callback) {
        const memberEventQueue = this.get(MemberEventQueue.prototype);
        const memberEvent = this.get(MemberEvent.prototype);
        memberEventQueue.push(memberEvent.Id);
    }
}