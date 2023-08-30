import { MemberEvent } from "./member-event.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class MemberEventCallStack extends Reference {
    constructor() {
        super('membereventcallstack');
    }
    /**
     * @returns {Boolean}
     */
    isValid = () => {
        const topOfStackEvent = super.get(MemberEvent.prototype);
        throw new Error('Not Implemented');
        for (const { Id } of topOfStackEvent.memberInfo.membersInfo) {
            if (this.memberEvents.find(me => me.memberInfo.Id === Id)) {
                return true;
            }
        }
        return false;
    }
    /**
     * @returns {MemberEvent}
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