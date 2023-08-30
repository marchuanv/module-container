import { MemberEventStack } from "./member-event-stack.mjs";
import { MemberEvent } from "./member-event.mjs";
import { RaisedEventSubscription } from "./raised-event-subscription.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class MemberEventPublisher extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} memberEventStackRefId
     * @param {ReferenceId} raisedEventSubscriptionId
     */
    constructor(memberEventRefId, memberEventStackRefId, raisedEventSubscriptionId) {
        super(`${memberEventRefId.name}_publisher`);
        super.dependency = memberEventRefId;
        super.dependency = memberEventStackRefId;
        super.dependency = raisedEventSubscriptionId;
    }
    /**
     * @param { Object } data
     */
    publish(data) {
        const thisEvent = super.get(MemberEvent.prototype);
        thisEvent.input = data;
        const memberEventStack = super.get(MemberEventStack.prototype);
        memberEventStack.unshift(thisEvent.Id);
        const raisedEventSubscription = super.get(RaisedEventSubscription.prototype);
        return new Promise((resolve) => {
            raisedEventSubscription.subscribe(async (raisedEvent) => {
                if (raisedEvent.memberEventId === thisEvent.Id) {
                    resolve(thisEvent.output);
                }
            });
        });
    }
}