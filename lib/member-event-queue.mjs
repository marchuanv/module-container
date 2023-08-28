import { MemberEvent } from './member-event.mjs';
import { Reference } from './reference/reference.mjs';
import { ReferenceId } from './reference/referenceId.mjs';
export class MemberEventQueue extends Reference {
    constructor() {
        super('eventqueue');
    }
    pop() {
        return this.get(MemberEvent).pop();
    }
    /**
     * @param {ReferenceId} memberEventRefId
     */
    push(memberEventRefId) {
        this.get(MemberEvent).push(memberEventRefId);
    }
}
