import { MemberEventSubscriptionStack } from "./member-event-subscription-stack.mjs";
import { MemberEvent } from "./member-event.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
const privateBag = new WeakMap();
export class MemberEventSubscription extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} memberEventSubscriptionStackRefId
     */
    constructor(memberEventRefId, memberEventSubscriptionStackRefId) {
        super(`${memberEventRefId.name}_subscription`);
        super.dependency = memberEventRefId;
        super.dependency = memberEventSubscriptionStackRefId;
    }
    async callback(data) {
        const memberEvent = super.get(MemberEvent.prototype);
        if (!memberEvent) {
            throw new Error('no associated event');
        }
        const { callback } = privateBag.get(this);
        return await callback(data);
    }
    /**
     * @param { Promise<MemberEvent> } callback
     */
    async subscribe(callback) {
        privateBag.set(this, { callback });
        const memberEventSubscriptionStack = super.get(MemberEventSubscriptionStack.prototype);
        memberEventSubscriptionStack.unshift(super.Id);
    }
}