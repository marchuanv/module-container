const callstackName = 'callstack';
const subscribers = new Map();
const privateVars = new Map();
const references = new WeakMap();
export class MemberEvent {
    constructor({ member }) {
        references.set(this, { member });
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
        const { member } = references.get(this);
        const memberInfo = member.info;
        const container = member.container;
        if (!memberInfo.enabled) {
            return;
        }
        const memberName = memberInfo.name;
        const memberParent = memberInfo.parent;
        const contextName = container.contextName;
        const memberId = memberInfo.Id;
        const errorHalt = memberInfo.errorHalt;
        try {
            getCallstack().unshift({ context: container.context, memberInfo });
            if (memberInfo.isPublic) {
                if (canCallBeforePublicMemberFunction({ memberInfo: memberParent })) {
                    const member = await container.context[memberParent.name];
                    await member();
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
            await container.context.log(`Raising Event: '${contextName}.${memberName}'`);
            const output = await callback.call(member, { data });
            await container.context.log(`Event Raised: '${contextName}.${memberName}'`);
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