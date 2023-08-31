import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberEventStack } from "../stack/member-event-stack.mjs";
import { MemberEvent } from "./member-event.mjs";
import { RaisedEventSubscription } from "./raised-event-subscription.mjs";
export class MemberEventPublisher extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} memberEventStackRefId
     * @param {ReferenceId} raisedEventSubscriptionRefId
     */
    constructor(memberEventRefId, memberEventStackRefId, raisedEventSubscriptionRefId) {
        super(`${memberEventRefId.name}_publisher`);
        super.addReference(memberEventRefId, MemberEvent.prototype);
        super.addReference(memberEventStackRefId, MemberEventStack.prototype);
        super.addReference(raisedEventSubscriptionRefId, RaisedEventSubscription.prototype);
    }
    /**
     * @param { Object } data
     */
    publish(data) {
        const thisEvent = super.getReference(MemberEvent.prototype);
        thisEvent.data = data;
        const memberEventStack = super.getReference(MemberEventStack.prototype);
        memberEventStack.unshift(thisEvent.Id);
        const raisedEventSubscription = super.getReference(RaisedEventSubscription.prototype);
        return new Promise((resolve) => {
            raisedEventSubscription.subscribe(async (raisedEvent) => {
                if (raisedEvent.memberEventId === thisEvent.Id) {
                    resolve(raisedEvent.data);
                }
            });
        });
    }
}