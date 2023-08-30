import { MemberEventStack } from "./member-event-stack.mjs";
import { MemberEventSubscriptionStack } from "./member-event-subscription-stack.mjs";
import { MemberEvent } from "./member-event.mjs";
import { RaisedEventStack } from "./raised-event-stack.mjs";
import { RaisedEventSubscriptionStack } from "./raised-event-subscription-stack.mjs";
import { RaisedEvent } from "./raised-event.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
const memberEventStack = new MemberEventStack();
const raisedEventStack = new RaisedEventStack();
const memberEventSubscriptionStack = new MemberEventSubscriptionStack();
const raisedEventSubscriptionStack = new RaisedEventSubscriptionStack();
const memberEventCallStack = new MemberEventStack();
export class EventManager extends Reference {
    /**
    * @param {ReferenceId} containerRefId
    */
    constructor(containerRefId) {
        super(`eventmanager`);
        this.dependency = containerRefId;
    }
    /**
     * @returns { ReferenceId }
     */
    get memberEventStackReferenceId() {
        return memberEventStack.Id;
    }
    /**
     * @returns { ReferenceId }
     */
    get raisedEventStackReferenceId() {
        return raisedEventStack.Id;
    }
    /**
     * @returns { ReferenceId }
     */
    get memberEventSubscriptionStackReferenceId() {
        return memberEventSubscriptionStack.Id;
    }
    /**
     * @returns { ReferenceId }
     */
    get raisedEventSubscriptionStackReferenceId() {
        return raisedEventSubscriptionStack.Id;
    }
    /**
     * @returns { ReferenceId }
     */
    get memberEventCallStackReferenceId() {
        return memberEventCallStack.Id;
    }
    async raiseEvents() {
        const id = setInterval(async () => {
            const memberEventSubscriptions = [];
            const raisedSubscriptions = [];
            const memberEvent = memberEventStack.shift();
            let memberEventSubscription = memberEventSubscriptionStack.shift();
            while (memberEventSubscription) {
                const subscriptionMemberEvent = memberEventSubscription.get(MemberEvent.prototype);
                if (subscriptionMemberEvent.Id === memberEvent.Id) {
                    memberEventSubscriptions.push(memberEventSubscription);
                }
                memberEventSubscription = memberEventSubscriptionStack.shift();
            }
            memberEvent.output = await memberEventSubscriptions[0].callback(memberEvent.input);
            const raisedEvent = new RaisedEvent(memberEvent.Id);
            raisedEventStack.unshift(raisedEvent.Id);
            let raisedEventSubscription = raisedEventSubscriptionStack.shift();
            while (raisedEventSubscription) {
                const subscriptionRaisedEvent = raisedEventSubscription.get(RaisedEvent.prototype);
                if (subscriptionRaisedEvent.Id === raisedEvent.Id) {
                    raisedSubscriptions.push(raisedEventSubscription);
                }
                raisedEventSubscription = raisedEventSubscriptionStack.shift();
            }
            for (const raisedSubscription of raisedSubscriptions) {
                await raisedSubscription.callback();
            }
        }, 100);
    }
}
