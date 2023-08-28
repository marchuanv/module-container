import { MemberEvent } from "./member-event.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class MemberEventCallStack extends Reference {
    constructor() {
        super('memberEventCallStack');
    }
    /**
     * @returns {Boolean}
     */
    isValid = () => {
        const topOfStackEvent = this.memberEvents[0];
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
        return this.memberEvents.shift();
    }
    /**
    * @param {ReferenceId} memberEventRefId
    */
    unshift(memberEventRefId) {
        return this.memberEvents.unshift(memberEventRefId);
    }
}