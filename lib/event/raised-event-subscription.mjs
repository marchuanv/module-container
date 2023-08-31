import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { RaisedEventSubscriptionStack } from "../stack/raised-event-subscription-stack.mjs";
import { MemberEvent } from "./member-event.mjs";
import { RaisedEvent } from "./raised-event.mjs";
const privateBag = new WeakMap();
export class RaisedEventSubscription extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} raisedEventSubsciptionStackRefId
     */
    constructor(memberEventRefId, raisedEventSubsciptionStackRefId) {
        super(`raised_${memberEventRefId.name}_subscription`);
        super.addReference(memberEventRefId, MemberEvent.prototype);
        super.addReference(raisedEventSubsciptionStackRefId, RaisedEventSubscriptionStack.prototype);
    }
    async callback() {
        const raisedEvent = super.getReference(RaisedEvent.prototype);
        if (!raisedEvent) {
            throw new Error('no associated raised event');
        }
        const { callback } = privateBag.set(this);
        await callback(raisedEvent);
    }
    /**
     * @param { Promise<RaisedEvent> } callback
     */
    async subscribe(callback) {
        privateBag.set(this, { callback });
        const raisedEventSubscriptionStack = super.getReference(RaisedEventSubscriptionStack.prototype);
        raisedEventSubscriptionStack.unshift(this.Id);
    }
}