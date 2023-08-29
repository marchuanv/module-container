import { MemberEventQueue } from "./member-event-queue.mjs";
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
    get callback() {
        return this.data.callback;
    }
    /**
     * @param { Promise<Object> } callback
     */
    async subscribe(callback) {
        this.data.callback = callback;
        const memberEventQueue = this.get(MemberEventQueue.prototype);
        memberEventQueue.push(this.Id);
    }
}