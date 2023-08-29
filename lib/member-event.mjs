import { MemberEventCallStack } from "./member-event-callstack.mjs";
import { MemberEventSubscription } from "./member-event-subscription.mjs";
import { MemberInfo } from "./member-info/member-info.mjs";
import { RaisedEventLogging } from "./raised-event-logging.mjs";
import { RaisedEvent } from "./raised-event.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class MemberEvent extends Reference {
    /**
    * @param {ReferenceId} memberInfoRefId
    * @param {ReferenceId} memberEventQueueRefId
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} memberEventCallStackRefId
    * @param {ReferenceId} raisedEventLoggingRefId
    */
    constructor(memberInfoRefId, memberEventQueueRefId, containerRefId, memberEventCallStackRefId, raisedEventLoggingRefId) {
        super(`${memberInfoRefId.name}_event`);
        this.dependency = memberInfoRefId;
        this.dependency = memberEventQueueRefId;
        this.dependency = containerRefId;
        this.dependency = memberEventCallStackRefId;
        this.dependency = raisedEventLoggingRefId;
    }
    async raise({ data }) {
        const memberInfo = this.get(MemberInfo.prototype);
        const memberEventCallStack = this.get(MemberEventCallStack.prototype);
        const memberEventSubscription = this.get(MemberEventSubscription.prototype);
        const raisedEventlogging = this.get(RaisedEventLogging.prototype);
        if (!memberInfo.enabled) {
            return;
        }
        const container = memberInfo.container;
        const memberName = memberInfo.name;
        const errorHalt = memberInfo.errorHalt;
        try {
            memberEventCallStack.unshift(this.Id);
            for (const memberInfoDep of memberInfo.membersInfo) {
                if (canCallBeforePublicMemberFunction({ memberInfo: memberInfoDep })) {
                    const memberFunction = memberInfoDep.functions[0];
                    await memberFunction(memberInfoDep.args);
                }
            }
            if (!memberEventCallStack.isValid()) {
                throw new Error(`${memberName} member is private for ${container.name}`);
            }
            if (canCallBeforePublicMemberFunction({ memberInfo })) {
                memberInfo.enabled = false;
            }
            const output = await memberEventSubscription.callback({ data });
            const raisedEvent = new RaisedEvent(`${this.name}_raised`, this.Id);
            raisedEventlogging.push(raisedEvent.Id);
            memberEventCallStack.shift();
            return output;
        } catch (error) {
            memberEventCallStack.shift();
            if (errorHalt) {
                throw error;
            }
        }
    }
}

const canCallBeforePublicMemberFunction = ({ memberInfo }) => {
    return memberInfo.isFunction && memberInfo.isCallBeforePublicMember && memberInfo.enabled;
}
