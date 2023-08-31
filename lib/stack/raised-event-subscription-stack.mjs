import { RaisedEventSubscription } from '../event/raised-event-subscription.mjs';
import { Reference } from '../reference/reference.mjs';
import { ReferenceId } from '../reference/referenceId.mjs';
export class RaisedEventSubscriptionStack extends Reference {
    constructor() {
        super('raisedeventsubscriptionstack');
    }
    /**
     * @return { RaisedEventSubscription }
     */
    shift() {
        return super.shiftReference(RaisedEventSubscription.prototype, true);
    }
    /**
     * @param {ReferenceId} raisedEventSubscriptionRefId
     */
    unshift(raisedEventSubscriptionRefId) {
        super.addReference(raisedEventSubscriptionRefId, RaisedEventSubscription.prototype);
    }
}
