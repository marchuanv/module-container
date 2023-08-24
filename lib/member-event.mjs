import utils from "utils";
import { Reference } from "./reference.mjs";
const callstackId = utils.generateGUID();
const subscribers = new Map();
let references = new WeakMap();
class RaisedEvents { };
export class MemberEvent {
    constructor({ name, memberInfoId }) {
        Reference.create({ name: `${name}_event`, object: this });
        references = member.container.references;
        references.set(this, {
            member,
            Id: utils.generateGUID(),
            memberId: member.Id,
            name: member.name,
            date: new Date(),
            microTime: process.hrtime.bigint(),
            contextName: member.container.contextName,
            contextId: member.container.contextId
        });
    }
    get Id() {
        const { Id } = references.get(this);
        return Id;
    }
    get memberId() {
        const { memberId } = references.get(this);
        return memberId;
    }
    get name() {
        const { name } = references.get(this);
        return name;
    }
    get date() {
        const { date } = references.get(this);
        return date;
    }
    get microTime() {
        const { microTime } = references.get(this);
        return microTime;
    }
    get contextName() {
        const { contextName } = references.get(this);
        return contextName;
    }
    get contextId() {
        const { contextId } = references.get(this);
        return contextId;
    }
    subscribe(callback) {
        const { member } = references.get(this);
        if (subscribers.has(member.info.Id)) {
            throw new Error(`'${member.info.name}' member is already subscribed to event`);
        } else {
            subscribers.set(member.info.Id, callback);
        }
    }
    unsubscribe() {
        const { member } = references.get(this);
        subscribers.delete(member.info.Id);
    }
    async raise({ data }) {
        const properties = references.get(this);
        properties.date = new Date();
        properties.microTime = process.hrtime.bigint();
        const { member, contextName } = properties;
        const references = member.container.references;
        const raisedEvents = references.get(RaisedEvents);
        const memberInfo = member.info;
        const container = member.container;
        if (!memberInfo.enabled) {
            return;
        }
        const memberName = memberInfo.name;
        const memberParent = memberInfo.parent;
        const memberId = memberInfo.Id;
        const errorHalt = memberInfo.errorHalt;
        try {
            getCallstack(references).unshift({ context: container.context, memberInfo });
            if (memberInfo.isPublic) {
                if (canCallBeforePublicMemberFunction({ memberInfo: memberParent })) {
                    const memberFunction = await container.context[memberParent.name];
                    await memberFunction();
                }
            } else {
                if (!isValidCallstack(references)) {
                    throw new Error(`${memberName} member is private for ${contextName}`);
                }
            }
            if (canCallBeforePublicMemberFunction({ memberInfo })) {
                memberInfo.enabled = false;
            }
            const callback = subscribers.get(memberId);
            const output = await callback.call(member, { data });
            raisedEvents.push(this);
            getCallstack(references).shift();
            return output;
        } catch (error) {
            getCallstack(references).shift();
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
const isValidCallstack = (references) => {
    const current = getCallstack(references, 0);
    for (const child of current.memberInfo.children) {
        if (getCallstack(references).find(cs => cs.memberInfo.Id === child.Id)) {
            return true;
        }
    }
    return false;
}
const getCallstack = (references, index = -1) => {
    if (index > -1) {
        return references.get(callstackId)[index];
    } else {
        return references.get(callstackId);
    }
}