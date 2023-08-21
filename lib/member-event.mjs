import utils from "utils";
const callstackName = 'callstack';
const subscribers = new Map();
const privateVars = new Map();
export class MemberEvent {
    constructor({ memberInfo, context }) {
        this.memberInfo = memberInfo;
        this.context = context;
        this.Id = utils.generateGUID();
    }
    subscribe(callback) {
        if (subscribers.has(this.memberInfo.Id)) {
            throw new Error(`'${this.memberInfo.name}' member is already subscribed to event`);
        } else {
            subscribers.set(this.memberInfo.Id, callback);
        }
    }
    unsubscribe() {
        subscribers.delete(this.memberInfo.Id);
    }
    async raise({ data }) {
        const memberInfo = this.memberInfo;
        if (!memberInfo.enabled) {
            return;
        }
        const memberName = memberInfo.name;
        const memberParent = memberInfo.parent;
        const contextName = this.context.contextName;
        const memberId = memberInfo.Id;
        const errorHalt = memberInfo.errorHalt;
        try {
            getCallstack().unshift({ context: this.context, memberInfo: this.memberInfo });
            if (memberInfo.isPublic) {
                if (canCallBeforePublicMemberFunction({ memberInfo: memberParent })) {
                    const member = await this.context[memberParent.name];
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
            const output = await callback.call(this.context, { memberInfo, data });
            getCallstack().shift();
            await this.context.log(`raised '${contextName}.${memberName}' event`);
            await this.context.log(`subscribers handled '${contextName}.${memberName}' event`);
            return output;
        } catch (error) {
            getCallstack().shift();
            if (errorHalt) {
                await this.context.log(error);
                throw error;
            } else {
                await this.context.log(error);
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