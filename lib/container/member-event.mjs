import utils from "utils";

const publicMemberRaisedEventStack = new Map();
const subscribers = new Map();
const events = new Map();

export class MemberEvent {
    constructor({ memberInfo, context }) {
        this.memberInfo = memberInfo;
        this.context = context;
        this.Id = utils.generateGUID();
        this.triggerCount = 0;
        if (!publicMemberRaisedEventStack.has(context.contextId)) {
            publicMemberRaisedEventStack.set(context.contextId, []);
        }
        if (events.has(memberInfo.Id)) {
            throw new Error(`'${memberInfo.name}' member already has an event`);
        } else {
            events.set(memberInfo.Id, this);
        }
    }
    static getEvent({ memberInfo }) {
        return events.get(memberInfo.Id);
    }
    subscribe(callback) {
        if (subscribers.has(this.memberInfo.Id)) {
            throw new Error(`'${this.memberInfo.name}' member is already subscribed to event`);
        } else {
            subscribers.set(this.memberInfo.Id, callback);
        }
    }
    async raise({ timeoutMill, resolve, reject, data }) {
        this.triggerCount =  this.triggerCount + 1;
        if (this.triggerCount > 1) {
            return setTimeout(async () => {
                await this.raise({ timeoutMill, resolve, reject, data });
            }, timeoutMill);
        }
        const memberInfo = this.memberInfo;
        const logging = this.context.logging;
        const contextName = this.context.constructor.name;
        const memberId = memberInfo.Id;
        const memberName = memberInfo.name;
        const errorHalt = memberInfo.errorHalt;
        const isPublic = memberInfo.isPublic;
        const contextId = this.context.contextId;
        const callback = subscribers.get(memberId);
        try {
            if (!isPublicMemberTopOfStack({ contextId })) {
                if (isPublic) {
                    shiftPublicMemberFromStack({ contextId });
                    putPublicMemberOnStack({ contextId, memberInfo });
                } else {
                    throw new Error(`'${memberName}' member is private for context ${contextId}`);
                }
            }
            await logging.log(`raised '${contextName}.${memberName}' event`);
            const output = await callback.call(this.context, { memberInfo, data });
            await logging.log(`subscribers handled '${contextName}.${memberName}' event`);
            this.triggerCount = this.triggerCount - 1;
            resolve(output);
        } catch (error) {
            this.triggerCount = this.triggerCount - 1;
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
const isPublicMemberTopOfStack = ({ contextId }) => {
    const topOfStackMemberInfo = publicMemberRaisedEventStack.get(contextId).shift();
    if (topOfStackMemberInfo) {
        if (topOfStackMemberInfo.isPublic) {
            return publicMemberRaisedEventStack.get(contextId).unshift(topOfStackMemberInfo);
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