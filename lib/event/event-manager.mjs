import { Container } from "../container.mjs";
import { RaisedEventPublisher } from "../event/raised-event-publisher.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberEventStack } from "../stack/member-event-stack.mjs";
import { MemberEventSubscriptionStack } from "../stack/member-event-subscription-stack.mjs";
import { RaisedEventStack } from "../stack/raised-event-stack.mjs";
import { RaisedEventSubscriptionStack } from "../stack/raised-event-subscription-stack.mjs";
import { MemberEvent } from "./member-event.mjs";
import { RaisedEvent } from "./raised-event.mjs";
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
        super.addReference(containerRefId, Container.prototype);
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

        memberEventSubscriptionStack.reset();
        raisedEventSubscriptionStack.reset();
        const memberEvent = memberEventStack.shift();
        if (!memberEvent) {
            return setTimeout(this.raiseEvents, 1000);
        }

        let memberEventSubscription = memberEventSubscriptionStack.shift();
        while (memberEventSubscription) {
            const subscriptionMemberEvent = memberEventSubscription.getReference(MemberEvent.prototype);
            if (subscriptionMemberEvent.Id === memberEvent.Id) {
                const instance = await memberEventSubscription.callback(memberEvent.data);
                const raisedEvent = new RaisedEvent(memberEvent.Id);
                const raisedEventPublisher = new RaisedEventPublisher(raisedEvent.Id, raisedEventStack.Id);
                raisedEventPublisher.publish(instance);
            }
            memberEventSubscription = memberEventSubscriptionStack.shift();
        }
        const raisedEvent = raisedEventStack.shift();
        let raisedEventSubscription = raisedEventSubscriptionStack.shift();
        while (raisedEventSubscription) {
            const subscriptionRaisedEvent = raisedEventSubscription.getReference(RaisedEvent.prototype);
            if (subscriptionRaisedEvent.Id === raisedEvent.Id) {
                await raisedEventSubscription.callback();
            }
            raisedEventSubscription = raisedEventSubscriptionStack.shift();
        }
        // }, 1000);
    }
}
