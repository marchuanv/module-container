import { MemberEventSubscription } from './member-event-subscription.mjs';
import { Reference } from './reference/reference.mjs';
import { ReferenceId } from './reference/referenceId.mjs';
export class MemberEventSubscriptionStack extends Reference {
    constructor() {
        super('membereventsubscriptionstack');
    }
    /**
     * @return { MemberEventSubscription }
     */
    shift() {
        const memberEventSubscription = super.get(MemberEventSubscription.prototype);
        super.dependantIds.shift();
        return memberEventSubscription;
    }
    /**
     * @param {ReferenceId} memberEventSubscriptionRefId
     */
    unshift(memberEventSubscriptionRefId) {
        super.dependency = memberEventSubscriptionRefId;
    }
}
