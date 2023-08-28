import { RaisedEvent } from "./raised-event.mjs";
import { MemberEventReference } from "./references/member-event-reference.mjs";
import { ReferenceId } from "./references/referenceId.mjs";

export class MemberEvent extends MemberEventReference {
    /**
    * @param {ReferenceId} memberInfoRefId
    * @param {ReferenceId} memberEventQueueRefId
    * @param {ReferenceId} containerRefId
    * @param {ReferenceId} memberEventCallStackRefId
    * @param {ReferenceId} raisedEventLoggingRefId
    */
    constructor(name, memberInfoRefId, memberEventQueueRefId, containerRefId, memberEventCallStackRefId, raisedEventLoggingRefId) {
        super(name);
        super.dependency = memberInfoRefId;
        super.dependency = memberEventQueueRefId;
        super.dependency = containerRefId;
        super.dependency = memberEventCallStackRefId;
        super.dependency = raisedEventLoggingRefId;
    }
    async raise({ data }) {
        if (!super.memberInfo.enabled) {
            return;
        }
        const container = super.memberInfo.container;
        const memberName = super.memberInfo.name;
        const errorHalt = super.memberInfo.errorHalt;
        try {
            super.memberEventCallStack.unshift(this.Id);
            for (const memberInfoDep of super.memberInfo.membersInfo) {
                if (canCallBeforePublicMemberFunction({ memberInfo: memberInfoDep })) {
                    const memberFunction = memberInfoDep.functions[0];
                    await memberFunction(memberInfoDep.args);
                }
            }
            if (!super.memberEventCallStack.isValid()) {
                throw new Error(`${memberName} member is private for ${container.name}`);
            }
            if (canCallBeforePublicMemberFunction({ memberInfo })) {
                super.memberInfo.enabled = false;
            }
            const output = await super.memberEventSubscriber.callback({ data });
            const raisedEvent = new RaisedEvent(`${this.name}_raised`, this.Id);
            super.raisedEventlogging.push(raisedEvent.Id);
            super.memberEventCallStack.shift();
            return output;
        } catch (error) {
            super.memberEventCallStack.shift();
            if (errorHalt) {
                throw error;
            }
        }
    }
}

const canCallBeforePublicMemberFunction = ({ memberInfo }) => {
    return memberInfo.isFunction && memberInfo.isCallBeforePublicMember && memberInfo.enabled;
}
