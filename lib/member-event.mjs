import utils from "utils";
import { MemberInfoReference } from "./member-info-reference.mjs";
import { MemberEventSubscriberReference } from "./member-event-subscriber-reference.mjs";
import { MemberEventReference } from "./member-event-reference.mjs";
import { Reference } from "./reference.mjs";
import { ContainerReference } from "./container-reference.mjs";
import { RaisedMemberEventReference } from "./raised-member-event-reference";
import { MemberEventCallstackReference } from "./member-event-callstack-reference.mjs";

export class MemberEvent {
    /**
    * @param {MemberInfoReference} memberInfoReference
    * @param {MemberEventSubscriberReference} memberEventSubscriberReference
    * @param {ContainerReference} containerReference
    * @param {MemberEventCallstackReference} memberEventCallstackReference
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
        const memberInfo = MemberInfoReference.memberInfo(this);
        const memberEventSubscriber = MemberEventSubscriberReference.memberEventSubscriber(this);
        const container = ContainerReference.container(this);
        const callstack = MemberEventCallstackReference.callstack(this);
        const { date, microTime } = Reference.bag(this);

        if (!memberInfo.enabled) {
            return;
        }
        const memberName = memberInfo.name;
        const memberParent = memberInfo.parent;
        const errorHalt = memberInfo.errorHalt;
        try {
            callstack.getCallstack().unshift({ context: container.context, memberInfo });
            if (memberInfo.isPublic) {
                if (canCallBeforePublicMemberFunction({ memberInfo: memberParent })) {
                    const memberFunction = await container.context[memberParent.name];
                    await memberFunction();
                }
            } else {
                if (!callstack.isValidCallstack()) {
                    throw new Error(`${memberName} member is private for ${contextName}`);
                }
            }
            if (canCallBeforePublicMemberFunction({ memberInfo })) {
                memberInfo.enabled = false;
            }
            date = new Date();
            microTime = process.hrtime.bigint();
            const output = await memberEventSubscriber.callback({ data });
            new RaisedMemberEventReference({
                Id, name, object: this,
                reference: Reference.get(this), bag: {
                    date: new Date(),
                    microTime: process.hrtime.bigint(),
                }
            });
            callstack.getCallstack().shift();
            return output;
        } catch (error) {
            callstack.getCallstack().shift();
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
