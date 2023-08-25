import utils from "utils";
import { MemberInfoReference } from "./references/member-info-reference.mjs";
import { MemberEventSubscriberReference } from "./references/member-event-subscriber-reference.mjs";
import { MemberEventReference } from "./references/member-event-reference.mjs";
import { Reference } from "./references/reference.mjs";
import { ContainerReference } from "./references/container-reference.mjs";
import { RaisedMemberEventReference } from "./references/raised-member-event-reference.mjs";
import { ContainerEventCallStackReference } from "./references/container-event-callstack-reference.mjs";
import { RaisedMemberEvent } from "./raised-member-event.mjs";

export class MemberEvent {
    /**
    * @param {MemberInfoReference} memberInfoReference
    * @param {MemberEventSubscriberReference} memberEventSubscriberReference
    * @param {ContainerReference} containerReference
    * @param {ContainerEventCallStackReference} memberEventCallstackReference
    */
    constructor(memberInfoReference, memberEventSubscriberReference, containerReference, memberEventCallstackReference) {
        const Id = utils.generateGUID();
        const name = `${memberReference.name}_event`;
        new MemberEventReference({
            Id, name, object: this,
            reference: {
                memberInfoReference,
                memberEventSubscriberReference,
                containerReference,
                memberEventCallstackReference
            }, bag: {
                date: new Date(),
                microTime: process.hrtime.bigint(),
            }
        });
    }
    async raise({ data }) {
        const memberInfo = MemberInfoReference.reference.memberInfo;
        const memberEventSubscriber = MemberEventSubscriberReference.reference.memberEventSubscriber;
        const container = ContainerReference.reference.container;
        const eventCallStack = ContainerEventCallStackReference.reference.containerEventCallStack;
        if (!memberInfo.enabled) {
            return;
        }
        const memberName = memberInfo.name;
        const memberParent = memberInfo.parent;
        const errorHalt = memberInfo.errorHalt;
        try {
            eventCallStack.unshift(MemberEventReference.reference);
            if (memberInfo.isPublic) {
                if (canCallBeforePublicMemberFunction({ memberInfo: memberParent })) {
                    const memberFunction = await container[memberParent.name];
                    await memberFunction();
                }
            } else {
                if (!eventCallStack.isValid()) {
                    throw new Error(`${memberName} member is private for ${container.name}`);
                }
            }
            if (canCallBeforePublicMemberFunction({ memberInfo })) {
                memberInfo.enabled = false;
            }

            const output = await memberEventSubscriber.callback({ data });
            const Id = MemberEventReference.reference.Id;
            const name = `${MemberEventReference.reference.name}_raised`;
            RaisedMemberEventReference.ctor({ Id, name, object: new RaisedMemberEvent(), references: [] });
            eventCallStack.shift();
            return output;
        } catch (error) {
            eventCallStack.shift();
            if (errorHalt) {
                await container.context.log(error);
                throw error;
            } else {
                await container.context.log(error);
            }
        }
    }
}

const canCallBeforePublicMemberFunction = ({ memberInfo }) => {
    return memberInfo.isFunction && memberInfo.isCallBeforePublicMember && memberInfo.enabled;
}
