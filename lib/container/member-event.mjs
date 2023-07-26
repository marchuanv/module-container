import utils from "utils";

const publicMemberRaisedEventStack = new Map();
const eventSubscriptions = new Map();
let events = [];
const findEvent = ({ contextId, memberId, isPublic }) => {
    const rootEvent = events.find(x => x.contextId == contextId);
    let currentEvent = rootEvent;
    if (isPublic) {
        let previousEvent = null;
        while (currentEvent) {
            if (previousEvent && previousEvent.isPublic && currentEvent.isPublic) {
                if (currentEvent.memberId === memberId && currentEvent.contextId === contextId) {
                    return { previousEvent, currentEvent };
                }
            }
            previousEvent = currentEvent;
            currentEvent = currentEvent.child;
        }
    }
    currentEvent = rootEvent;
    while (currentEvent) {
        if (currentEvent.memberId === memberId && currentEvent.contextId === contextId) {
            return currentEvent;
        }
        currentEvent = currentEvent.child;
    }
}
export class MemberEvent {
    constructor({ memberInfo, context }) {
        this.memberInfo = memberInfo;
        this.context = context;
        this.Id = utils.generateGUID();
        if (!publicMemberRaisedEventStack.has(context.contextId)) {
            publicMemberRaisedEventStack.set(context.contextId, []);
        }
        if (!eventSubscriptions.has(memberInfo.Id)) {
            eventSubscriptions.set(memberInfo.Id, []);
        }
        if (events.length === 0 && memberInfo.isPublic) {
            events.push({
                child: null,
                contextId: context.contextId,
                isPublic: memberInfo.isPublic,
                memberName: memberInfo.name,
                memberId: memberInfo.Id,
                call: 0,
                contextName: context.constructor.name
            });
        } else if (memberInfo.isPublic) {
            if (!events.find(x => x.contextId === this.context.contextId)) {
                events.push({
                    child: null,
                    contextId: this.context.contextId,
                    isPublic: memberInfo.isPublic,
                    memberName: memberInfo.name,
                    memberId: memberInfo.Id,
                    call: 0,
                    contextName: context.constructor.name
                });
            }
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
            const memberId = memberInfo.Id;
            const memberName = memberInfo.name;
            const isPublic = memberInfo.isPublic;
            const contextId = this.context.contextId;

            let event = findEvent({ contextId, memberId });
            if (!event) {
                event = { child: null, contextId, isPublic, memberName, memberId, call: 0, contextName };
                const rootEvent = events.find(x => x.contextId == contextId);
                if (rootEvent.child) {
                    let node = rootEvent.child;
                    while (node) {
                        if (!node.child) {
                            node.child = event;
                            break;
                        }
                        node = node.child
                    }
                } else {
                    rootEvent.child = event;
                }
            }
            event.call = event.call + 1;
            const subscriptions = eventSubscriptions.get(memberInfo.Id);
            const callback = subscriptions[0];
            try {
                if (memberInfo.isPublic) {
                    publicMemberRaisedEventStack.delete(contextId);
                    publicMemberRaisedEventStack.set(contextId, []);
                    publicMemberRaisedEventStack.get(contextId).unshift(this);
                    if (event.call > 1) {
                        return setTimeout(async () => {
                            await this.raise({ timeoutMill, resolve, reject, data });
                        }, 100);
                    }
                }
                if (!isPublicMemberTopOfStack({ contextId })) {
                    const message = `'${memberName}' member is private for context ${contextId}`;
                    throw new Error(message);
                }
                await logging.log(`raised '${contextName}.${memberName}' event`);
                const output = await callback.call(this.context, { memberInfo, data });
                await logging.log(`subscribers handled '${contextName}.${memberName}' event`);
                event.call = event.call -1;
                resolve(output);
            } catch (error) {
                event.call = event.call -1;
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