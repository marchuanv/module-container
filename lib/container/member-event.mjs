import utils from "utils";

const publicMemberRaisedEventStack = new Map();
const eventSubscriptions = new Map();
let events = [];
const getPublicEvent = ({ contextId, memberId }) => {
    for(const publicEvent of events) {
        let currentEvent = publicEvent;
        while (currentEvent) {
            if (currentEvent.memberId === memberId && currentEvent.contextId === contextId) {
                return currentEvent;
            }
            currentEvent = currentEvent.child;
        }
    }
}
const createEvent = ({ context, memberInfo }) => {
    const parentEvent = events.filter(x => x.contextId === context.contextId)[0];
    const event = { 
        child: parentEvent,
        contextId: context.contextId,
        isPublic: memberInfo.isPublic,
        memberName: memberInfo.name,
        memberId: memberInfo.Id,
        calls: 0,
        contextName: context.constructor.name
    };
    events.unshift(event);
    return event;
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
        if (memberInfo.isPublic) {
            if (!events.find(x => x.contextId === this.context.contextId && x.memberId === this.memberInfo.Id)) {
                createEvent({ context, memberInfo });
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
            const errorHalt = memberInfo.errorHalt;
            const isPublic = memberInfo.isPublic;
            const contextId = this.context.contextId;
            let event = getPublicEvent({ contextId, memberId });
            if (!event) {
                event = createEvent({ context: this.context, memberInfo: this.memberInfo });
            }
            event.call = event.call + 1;
            const subscriptions = eventSubscriptions.get(memberId);
            const callback = subscriptions[0];
            try {
                if (isPublic) {
                    if (event.call > 1) {
                        return setTimeout(async () => {
                            await this.raise({ timeoutMill, resolve, reject, data });
                        }, 100);
                    }
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
                event.call = event.call -1;
                resolve(output);
            } catch (error) {
                event.call = event.call -1;
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