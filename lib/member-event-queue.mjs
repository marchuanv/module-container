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
     * @param {ReferenceId} referenceId
     */
    push(referenceId) {
        this.dependency = referenceId;
    }
}
