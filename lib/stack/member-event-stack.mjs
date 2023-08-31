import { MemberEvent } from '../event/member-event.mjs';
import { Reference } from '../reference/reference.mjs';
import { ReferenceId } from '../reference/referenceId.mjs';
export class MemberEventStack extends Reference {
    constructor() {
        super('membereventstack');
    }
    /**
     * @return { MemberEvent }
     */
    shift() {
        return super.shiftStack(MemberEvent.prototype);
    }
    reset() {
        return super.resetStack(MemberEvent.prototype);
    }
    /**
     * @param {ReferenceId} memberEventRefId
     */
    unshift(memberEventRefId) {
        super.addReference(memberEventRefId, MemberEvent.prototype);
    }
}
