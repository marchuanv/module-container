const raisedEventStack = new Map();
const eventSubscriptions = new Map();

export class MemberEvent {
    constructor({ memberInfo, context }) {
        this.memberInfo = memberInfo;
        this.context = context;
        if (!raisedEventStack.has(context.contextId)) {
            raisedEventStack.set(context.contextId, []);
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
            try {
                if (memberInfo.isPublic) {
                    raisedEventStack.delete(contextId);
                    raisedEventStack.set(contextId, []);
                    raisedEventStack.get(contextId).unshift(this);
                }
                if (!isPublicMemberTopOfStack({ contextId })) {
                    const message = `'${memberName}' member is private for context ${contextId}`;
                    return reject(new Error(message));
                }
                logging.log(`'${contextName}.${memberName}' member event raised in ${contextId} context, is delegating control to subscriber.`);
                const output = await callback.call(this.context, { memberInfo, data });
                logging.log(`'${contextName}.${memberName}' member event raised in ${contextId} context, got response from subscriber.`);
                resolve(output);
            } catch (error) {
                if (memberInfo.errorHalt) {
                    logging.log(error);
                    reject(error);
                } else {
                    logging.log(error);
                    resolve(memberInfo.errorReturn);
                }
            }
        }, timeoutMill);
    }
}

const isPublicMemberTopOfStack = ({ contextId }) => {
    return raisedEventStack.get(contextId)[0] ? raisedEventStack.get(contextId)[0].memberInfo.isPublic : false;
}