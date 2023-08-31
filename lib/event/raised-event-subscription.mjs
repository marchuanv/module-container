import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { RaisedEventSubscriptionStack } from "../stack/raised-event-subscription-stack.mjs";
import { MemberEvent } from "./member-event.mjs";
import { RaisedEvent } from "./raised-event.mjs";
const privateBag = new WeakMap();
export class RaisedEventSubscription extends Reference {
    /**
     * @param {ReferenceId} raisedEventRefId
     * @param {ReferenceId} raisedEventSubsciptionStackRefId
     */
    constructor(raisedEventRefId, raisedEventSubsciptionStackRefId) {
        super(`raised_${raisedEventRefId.name}_subscription`);
        super.addReference(raisedEventRefId, MemberEvent.prototype);
        super.addReference(raisedEventSubsciptionStackRefId, RaisedEventSubscriptionStack.prototype);
    }
    async callback(data) {
        const raisedEvent = super.getReference(RaisedEvent.prototype);
        const { callback } = privateBag.set(this);
        raisedEvent.data = await callback(data);
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