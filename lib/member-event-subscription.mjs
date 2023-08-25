import { MemberEventSubscriptionReference } from "./references/member-event-subscription-reference.mjs";
import { ReferenceId } from "./references/referenceId.mjs";
const refs = new WeakMap();
export class MemberEventSubscription extends MemberEventSubscriptionReference {
    /**
     * @param {String} name 
     * @param {ReferenceId} memberEventSubscriberRefId
     * @param {ReferenceId} memberEventQueueRefId
     * @param {ReferenceId} dataId
     */
    constructor(name, memberEventSubscriberRefId, memberEventQueueRefId, dataId) {
        super(name);
        super.dependency = memberEventSubscriberRefId;
        super.dependency = memberEventQueueRefId;
        super.memberEventQueue.push(this);
        refs.set(this, dataId);
    }
    get callback() {
        const refId = refs.get(this);
        const { callbackFunction } = super.getData(refId);
        return callbackFunction;
    }
}