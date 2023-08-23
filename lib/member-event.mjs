const callstackName = 'callstack';
const subscribers = new Map();
const privateVars = new Map();
const allProperties = new WeakMap();
export class MemberEvent {
    constructor({ member }) {
        allProperties.set(this, {
            member,
            Id: member.Id,
            name: member.name,
            date: new Date(),
            isRaised: false,
            microTime: process.hrtime.bigint(),
            contextName: member.container.contextName,
            contextId: member.container.contextId
        });
    }
    get Id() {
        const { Id } = allProperties.get(this);
        return Id;
    }
    get name() {
        const { name } = allProperties.get(this);
        return name;
    }
    get date() {
        const { date } = allProperties.get(this);
        return date;
    }
    get isRaised() {
        const { isRaised } = allProperties.get(this);
        return isRaised;
    }
    get microTime() {
        const { microTime } = allProperties.get(this);
        return microTime;
    }
    get contextName() {
        const { contextName } = allProperties.get(this);
        return contextName;
    }
    get contextId() {
        const { contextId } = allProperties.get(this);
        return contextId;
    }
    subscribe(callback) {
        const { member } = allProperties.get(this);
        if (subscribers.has(member.info.Id)) {
            throw new Error(`'${member.info.name}' member is already subscribed to event`);
        } else {
            subscribers.set(member.info.Id, callback);
        }
    }
    unsubscribe() {
        const { member } = allProperties.get(this);
        subscribers.delete(member.info.Id);
    }
    async raise({ data }) {
        const properties = allProperties.get(this);
        const { member, contextName } = properties;
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
            getCallstack().unshift({ context: container.context, memberInfo });
            if (memberInfo.isPublic) {
                if (canCallBeforePublicMemberFunction({ memberInfo: memberParent })) {
                    const memberFunction = await container.context[memberParent.name];
                    await memberFunction();
                }
            } else {
                if (!isValidCallstack()) {
                    throw new Error(`${memberName} member is private for ${contextName}`);
                }
            }
            if (canCallBeforePublicMemberFunction({ memberInfo })) {
                memberInfo.enabled = false;
            }
            const callback = subscribers.get(memberId);
            const output = await callback.call(member, { data });
            properties.date = new Date();
            properties.microTime = process.hrtime.bigint();
            properties.isRaised = true;
            getCallstack().shift();
            return output;
        } catch (error) {
            getCallstack().shift();
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
const isValidCallstack = () => {
    const current = getCallstack(0);
    for (const child of current.memberInfo.children) {
        if (getCallstack().find(cs => cs.memberInfo.Id === child.Id)) {
            return true;
        }
    }
    return false;
}
const getCallstack = (index = -1) => {
    if (index > -1) {
        return privateVars.get(callstackName)[index];
    } else {
        return privateVars.get(callstackName);
    }
}
const setCallstack = (callstack) => {
    return privateVars.set(callstackName, callstack);
}
setCallstack([]);