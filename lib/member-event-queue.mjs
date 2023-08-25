import { MemberEventQueueReference } from './references/member-event-queue-reference.mjs'
const refs = new WeakMap();
export class MemberEventQueue extends MemberEventQueueReference {
    constructor() {
        super('eventqueue');
        const refId = super.setData({ queue: [] });
        refs.set(this, refId);
    }
    pop() {
        const refId = refs.get(this);
        const { queue } = super.getData(refId);
        return queue.pop();
    }
    push(value) {
        const refId = refs.get(this);
        const { queue } = super.getData(refId);
        queue.push(value);
    }
}
