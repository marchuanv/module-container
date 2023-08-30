import { RaisedEvent } from './raised-event.mjs';
import { Reference } from './reference/reference.mjs';
import { ReferenceId } from './reference/referenceId.mjs';
export class RaisedEventStack extends Reference {
    constructor() {
        super('raisedeventstack');
    }
    /**
     * @return { RaisedEvent }
     */
    shift() {
        const raisedEvent = super.get(RaisedEvent.prototype);
        super.dependantIds.shift();
        return raisedEvent;
    }
    /**
     * @param {ReferenceId} raisedEventRefId
     */
    unshift(raisedEventRefId) {
        super.dependency = raisedEventRefId;
    }
}
