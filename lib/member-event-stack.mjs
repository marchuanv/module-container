import { MemberEvent } from './member-event.mjs';
import { Reference } from './reference/reference.mjs';
import { ReferenceId } from './reference/referenceId.mjs';
export class MemberEventStack extends Reference {
    constructor() {
        super('membereventstack');
    }
    /**
     * @return { MemberEvent }
     */
    shift() {
        const memberEvent = super.get(MemberEvent.prototype);
        super.dependantIds.shift();
        return memberEvent;
    }
    /**
     * @param {ReferenceId} memberEventRefId
     */
    unshift(memberEventRefId) {
        super.dependency = memberEventRefId;
    }
}
