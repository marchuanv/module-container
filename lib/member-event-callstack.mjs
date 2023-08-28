import { MemberEvent } from "./member-event.mjs";
import { MemberEventCallStackReference } from "./references/member-event-callstack-reference.mjs";
import { ReferenceId } from "./references/referenceId.mjs";
export class MemberEventCallStack extends MemberEventCallStackReference {
    /**
    * @param {String} name
    */
    constructor(name) {
        super(name);
    }
    /**
     * @returns {Boolean}
     */
    isValid = () => {
        const topOfStackEvent = super.memberEvents[0];
        for (const { Id } of topOfStackEvent.memberInfo.membersInfo) {
            if (super.memberEvents.find(me => me.memberInfo.Id === Id)) {
                return true;
            }
        }
        return false;
    }
    /**
     * @returns {MemberEvent}
     */
    shift() {
        return super.memberEvents.shift();
    }
    /**
    * @param {ReferenceId} memberEventRefId
    */
    unshift(memberEventRefId) {
        return super.memberEvents.unshift(memberEventRefId);
    }
}