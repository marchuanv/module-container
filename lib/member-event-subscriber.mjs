import { MemberEventSubscriberReference } from "./references/member-event-subscriber-reference.mjs";
import { MemberEventSubscription } from "./member-event-subscription.mjs";
import { ReferenceId } from "./references/referenceId.mjs";
export class MemberEventSubscriber extends MemberEventSubscriberReference {
    /**
     * @param {String} name 
     * @param {ReferenceId} memberEventRefId 
     * @param {ReferenceId} memberEventQueueRefId 
     */
    constructor(name, memberEventRefId, memberEventQueueRefId) {
        super(name);
        super.dependency = memberEventRefId;
        super.dependency = memberEventQueueRefId;
    }
    /**
     * @param { Function } callback 
     */
    async subscribe(callback) {
        const name = `${super.member.name}_subscription`;
        const dataId = super.setData({ callbackFunction: callback });
        const subscription = new MemberEventSubscription(name, super.Id, super.memberEventQueue.Id, dataId);
        super.memberEventQueue.push(subscription);
    }
}