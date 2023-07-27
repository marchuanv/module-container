import utils from "utils";

const publicMemberRaisedEventStack = new Map();
const eventSubscriptions = new Map();

export class MemberEvent {
    constructor({ memberInfo, context }) {
        this.memberInfo = memberInfo;
        this.context = context;
        this.Id = utils.generateGUID();
        this.triggerCount = 0;
        if (!publicMemberRaisedEventStack.has(context.contextId)) {
            publicMemberRaisedEventStack.set(context.contextId, []);
        }
        if (!eventSubscriptions.has(memberInfo.Id)) {
            eventSubscriptions.set(memberInfo.Id, []);
        }
    }
    subscribe(callback) {
        eventSubscriptions.get(this.memberInfo.Id).push(callback);
    }
    raise({ timeoutMill, resolve, reject, data }) {
        this.triggerCount =  this.triggerCount + 1;
        if (this.triggerCount > 1) {
            return setTimeout(async () => {
                await this.raise({ timeoutMill, resolve, reject, data });
            }, 100);
        }
        setTimeout(async () => {
            
            const memberInfo = this.memberInfo;
            const logging = this.context.logging;
            const contextName = this.context.constructor.name;
            const memberId = memberInfo.Id;
            const memberName = memberInfo.name;
            const errorHalt = memberInfo.errorHalt;
            const isPublic = memberInfo.isPublic;
            const contextId = this.context.contextId;
            const subscriptions = eventSubscriptions.get(memberId);
            const callback = subscriptions[0];

            try {
                if (isPublic) {
                    publicMemberRaisedEventStack.delete(contextId);
                    publicMemberRaisedEventStack.set(contextId, []);
                    publicMemberRaisedEventStack.get(contextId).unshift(this);
                }
                if (!isPublicMemberTopOfStack({ contextId })) {
                    const message = `'${memberName}' member is private for context ${contextId}`;
                    throw new Error(message);
                }
                await logging.log(`raised '${contextName}.${memberName}' event`);
                const output = await callback.call(this.context, { memberInfo, data });
                await logging.log(`subscribers handled '${contextName}.${memberName}' event`);
                this.triggerCount = this.triggerCount -1;
                resolve(output);
            } catch (error) {
                this.triggerCount = this.triggerCount -1;
                if (errorHalt) {
                    await logging.log(error);
                    reject(error);
                } else {
                    await logging.log(error);
                    resolve();
                }
            }
        }, timeoutMill);
    }
}

const isPublicMemberTopOfStack = ({ contextId }) => {
    return publicMemberRaisedEventStack.get(contextId)[0] ? publicMemberRaisedEventStack.get(contextId)[0].memberInfo.isPublic : false;
}