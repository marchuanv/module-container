import { MemberEventQueue } from "../member-event-queue.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventQueueReference extends Reference {
    /**
     * @param {String} name 
     */
    constructor(name) {
        super(name, this, MemberEventQueue);
    }
}
