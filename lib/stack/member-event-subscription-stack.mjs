import { MemberEventSubscription } from '../event/member-event-subscription.mjs';
import { Reference } from '../reference/reference.mjs';
import { ReferenceId } from '../reference/referenceId.mjs';
export class MemberEventSubscriptionStack extends Reference {
    constructor() {
        super('membereventsubscriptionstack');
    }
    /**
     * @return { MemberEventSubscription }
     */
    shift() {
        return super.shiftReference(MemberEventSubscription.prototype, true);
    }
    /**
     * @param {ReferenceId} memberEventSubscriptionRefId
     */
    unshift(memberEventSubscriptionRefId) {
        super.addReference(memberEventSubscriptionRefId, MemberEventSubscription.prototype);
    }
}
