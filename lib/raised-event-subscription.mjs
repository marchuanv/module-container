import { RaisedEventSubscriptionStack } from "./raised-event-subscription-stack.mjs";
import { RaisedEvent } from "./raised-event.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
const privateBag = new WeakMap();
export class RaisedEventSubscription extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} raisedEventSubsciptionStackRefId
     */
    constructor(memberEventRefId, raisedEventSubsciptionStackRefId) {
        super(`raised_${memberEventRefId.name}_subscription`);
        super.dependency = memberEventRefId;
        super.dependency = raisedEventSubsciptionStackRefId;
    }
    async callback() {
        const raisedEvent = this.get(RaisedEvent.prototype);
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
        const raisedEventSubscriptionStack = this.get(RaisedEventSubscriptionStack.prototype);
        raisedEventSubscriptionStack.unshift(this.Id);
    }
}