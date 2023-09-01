import { MemberEvent } from '../event/member-event.mjs';
import { Reference } from '../reference/reference.mjs';
import { ReferenceId } from '../reference/referenceId.mjs';
const privateBag = new WeakMap();
export class MemberEventStack extends Reference {
    constructor() {
        super('membereventstack');
        privateBag.set(this, { callbacks: [] });
    }
    /**
    * @param { Function<MemberEvent> } callback
    */
    onShift(callback) {
        const { callbacks } = privateBag.get(this);
        callbacks.push(callback);
    }
    /**
     * @return { MemberEvent }
     */
    shift() {
        const { callbacks } = privateBag.get(this);
        const event = super.shiftStack(MemberEvent.prototype);
        if (event) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
        return event;
    }
    reset() {
        return super.resetStack(MemberEvent.prototype);
    }
    /**
     * @param {ReferenceId} memberEventRefId
     */
    unshift(memberEventRefId) {
        super.addReference(memberEventRefId, MemberEvent.prototype);
    }
    raiseEvents() {
        setInterval(() => {
            let event = this.shift();
            while (event) {
                event = this.shift();
            }
        }, 1000)
    }
}
