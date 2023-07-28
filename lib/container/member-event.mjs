import utils from "utils";
const subscribers = new Map();
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
        const memberName = memberInfo.name;
        const contextName = this.context.constructor.name;
        const logging = this.context.logging;
        const memberId = memberInfo.Id;
        const errorHalt = memberInfo.errorHalt;
        try {
            if (memberInfo.isPublic) {
                if (memberInfo.parent && memberInfo.parent.isCallBeforePublicMember && memberInfo.parent.enabled) {
                    const callBeforePublicMember = async () => {
                        const member = await this.context[memberInfo.parent.name];
                        await member();
                    }
                    await callBeforePublicMember.call(this.context);
                    memberInfo.parent.enabled = false;
                }
            } else {
                let stackStr = (new Error()).stack;
                let isValidCall = false;
                for (const child of memberInfo.children) {
                    if (stackStr.indexOf(`${contextName}.${child.name}`) > -1) {
                        isValidCall =true;
                        break;
                    };
                }
                if (!isValidCall && stackStr.indexOf(`${contextName}.callback`) > -1) {
                    isValidCall =true;
                };
                if (!isValidCall && stackStr.indexOf(`${contextName}.callBeforePublicMember`) > -1) {
                    isValidCall =true;
                };
                if (!isValidCall) {
                    return reject(new Error(`${memberName} member is private for ${contextName}`));
                }
            }
            await logging.log(`raised '${contextName}.${memberName}' event`);
            const callback = subscribers.get(memberId);
            const output = await callback.call(this.context, { memberInfo, data });
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
const isPublicMemberTopOfStack = ({ contextId, isProxy }) => {
    const topOfStackMemberInfo = publicMemberRaisedEventStack.get(contextId).shift();
    if (topOfStackMemberInfo) {
        if (topOfStackMemberInfo.isPublic) {
            if (topOfStackMemberInfo.isProxy === isProxy) {
                return publicMemberRaisedEventStack.get(contextId).unshift(topOfStackMemberInfo);
            }
        }
    }
    return false;
}
const shiftPublicMemberFromStack = ({ contextId }) => {
    publicMemberRaisedEventStack.get(contextId).shift();
}
const putPublicMemberOnStack = ({ contextId, memberInfo }) => {
    publicMemberRaisedEventStack.get(contextId).unshift(memberInfo);
}