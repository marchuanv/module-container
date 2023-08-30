import { RaisedEventSubscription } from './raised-event-subscription.mjs';
import { Reference } from './reference/reference.mjs';
import { ReferenceId } from './reference/referenceId.mjs';
export class RaisedEventSubscriptionStack extends Reference {
    constructor() {
        super('raisedeventsubscriptionstack');
    }
    /**
     * @return { RaisedEventSubscription }
     */
    shift() {
        const raisedEventSubscription = super.get(RaisedEventSubscription.prototype);
        super.dependantIds.shift();
        return raisedEventSubscription;
    }
    /**
     * @param {ReferenceId} raisedEventSubscriptionRefId
     */
    unshift(raisedEventSubscriptionRefId) {
        super.dependency = raisedEventSubscriptionRefId;
    }
}
