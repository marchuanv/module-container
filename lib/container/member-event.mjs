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
    raise({ timeoutMill, resolve, reject, data, retryCount = 0 }) {
        setTimeout(async () => {
            console.log('\r\n');
            
            const memberInfo = this.memberInfo;
            const contextName = this.context.constructor.name;
            const contextId = this.context.contextId;
            const memberName = memberInfo.name;
            const memberId = memberInfo.Id;

            const subscriptions = eventSubscriptions.get(memberId);
            if (subscriptions.length === 0) {
                return reject(new Error(`no subscriptions found for ${memberName} member`));
            }
            const callback = subscriptions[0];
            try {
                if (memberInfo.isPublic) {
                    raisedEventStack.delete(contextId);
                    raisedEventStack.set(contextId, []);
                    raisedEventStack.get(contextId).unshift(this);
                }
                else {
                    if (raisedEventStack.get(contextId)[0]) {
                        if (raisedEventStack.get(contextId)[0].context.contextId !== contextId) {
                            if (retryCount < 20) {
                                return setTimeout(async () => { 
                                    retryCount = retryCount + 1;
                                    await this.raise({ timeoutMill, resolve, reject, data, retryCount });
                                },100);
                            } else {
                                const message = `Unable to access member: ${memberName} on context ${raisedEventStack.get(contextId)[0].contextId}, it is private to: ${contextId}`;
                                return reject(new Error(message));
                            }
                        }
                    } else {
                        if (retryCount < 20) {
                            return setTimeout(async () => { 
                                retryCount = retryCount + 1;
                                await this.raise({ timeoutMill, resolve, reject, data, retryCount });
                            },100);
                        } else {
                            const message = `Unable to access member: ${memberName}, no public member events was on the event stack`;
                            return reject(new Error(message));
                        }
                    }
                }
                console.log(`'${contextName}.${memberName}' member event raised in ${contextId} context, is delegating control to subscriber.`);
                const output = await callback.call(this.context, { memberInfo, data });
                console.log(`'${contextName}.${memberName}' member event raised in ${contextId} context, got response from subscriber.`);
                resolve(output);
            } catch (error) {
                if (memberInfo.errorHalt) {
                    console.log(`'${contextName}.${memberName}' member event raised in ${contextId} context resulted in error: `, error);
                    reject(error);
                } else {
                    console.log(`'${contextName}.${memberName}' member event raised in ${contextId} context resulted in error: `, error);
                    resolve(memberInfo.errorReturn);
                }
            }
        }, timeoutMill);
    }
}