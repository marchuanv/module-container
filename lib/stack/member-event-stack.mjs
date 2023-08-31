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
        return super.shift(MemberEvent.prototype);
    }
    /**
     * @param {ReferenceId} memberEventRefId
     */
    unshift(memberEventRefId) {
        super.dependency = memberEventRefId;
    }
}
