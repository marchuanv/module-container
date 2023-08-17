import utils from "utils";
const subscribers = new Map();
const callstack = new Map();
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
    async raise({ resolve, reject, data }) {
        const memberInfo = this.memberInfo;
        if (!memberInfo.enabled) {
            return;
        }
        const eventId = this.Id;
        const memberName = memberInfo.name;
        const contextId = this.context.contextId;
        const contextName = this.context.contextName;
        const logging = this.context.logging;
        const memberId = memberInfo.Id;
        const errorHalt = memberInfo.errorHalt;
        try {
            callstack.set(eventId, contextId);
            if (memberInfo.isPublic) {
                if (canCallBeforePublicMemberFunction({ memberInfo: memberInfo.parent })) {
                    const member = await this.context[memberInfo.parent.name];
                    await member();
                }
            } else {
                if (!isValidCallstack({ memberInfo })) {
                    return reject(new Error(`${memberName} member is private for ${contextName}`));
                }
            }
            if (canCallBeforePublicMemberFunction({ memberInfo })) {
                memberInfo.enabled = false;
            }
            const callback = subscribers.get(memberId);
            const output = await callback.call(this.context, { memberInfo, data });
            callstack.delete(eventId);
            await logging.log(`raised '${contextName}.${memberName}' event`);
            await logging.log(`subscribers handled '${contextName}.${memberName}' event`);
            resolve(output);
        } catch (error) {
            if (errorHalt) {
                await logging.log(error);
                reject(error);
            } else {
                await logging.log(error);
                resolve();
            }
        }
    }
}

const canCallBeforePublicMemberFunction = ({ memberInfo }) => {
    return memberInfo.isFunction && memberInfo.isCallBeforePublicMember && memberInfo.enabled;
}

const isValidCallstack = ({ memberInfo }) => {
    let stackStr = (new Error()).stack;
    let isValidCall = false;

    for (const child of memberInfo.children) {
        if (stackStr.indexOf(`${contextName}.${child.name}`) > -1) {
            isValidCall = true;
            break;
        };
    }
    if (!isValidCall && stackStr.indexOf(`${contextName}.callback`) > -1) {
        isValidCall = true;
    };
    if (!isValidCall && stackStr.indexOf(`${contextName}.callBeforePublicMember`) > -1) {
        isValidCall = true;
    };
}