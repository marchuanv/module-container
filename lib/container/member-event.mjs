const publicMemberRaisedEventStack = new Map();
const eventSubscriptions = new Map();

export class MemberEvent {
    constructor({ memberInfo, context }) {
        this.memberInfo = memberInfo;
        this.context = context;
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
        setTimeout(async () => {
            const memberInfo = this.memberInfo;
            const logging = this.context.logging;
            const contextName = this.context.constructor.name;
            const contextId = this.context.contextId;
            const memberName = memberInfo.name;
            const subscriptions = eventSubscriptions.get(memberInfo.Id);
            const callback = subscriptions[0];
            if (memberInfo.isPublic) {
                publicMemberRaisedEventStack.delete(contextId);
                publicMemberRaisedEventStack.set(contextId, []);
                publicMemberRaisedEventStack.get(contextId).unshift(this);
            }
            try {
                if (!isPublicMemberTopOfStack({ contextId })) {
                    const message = `'${memberName}' member is private for context ${contextId}`;
                    return reject(new Error(message));
                }
                await logging.log(`raised '${contextName}.${memberName}' event`);
                const output = await callback.call(this.context, { memberInfo, data });
                await logging.log(`subscribers handled '${contextName}.${memberName}' event`);
                resolve(output);
            } catch (error) {
                if (memberInfo.errorHalt) {
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