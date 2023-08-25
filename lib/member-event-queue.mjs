import { MemberEventQueueReference } from './references/member-event-queue-reference.mjs'
const queue = new Array();
export class MemberEventQueue extends MemberEventQueueReference {
    constructor() {
        super('eventqueue');
    }
    pop() {
        return queue.pop();
    }
    push(value) {
        queue.push(value);
    }
}
