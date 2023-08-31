import { RaisedEvent } from '../event/raised-event.mjs';
import { Reference } from '../reference/reference.mjs';
import { ReferenceId } from '../reference/referenceId.mjs';
export class RaisedEventStack extends Reference {
    constructor() {
        super('raisedeventstack');
    }
    /**
     * @return { RaisedEvent }
     */
    shift() {
        return super.shift(RaisedEvent.prototype);
    }
    /**
     * @param {ReferenceId} raisedEventRefId
     */
    unshift(raisedEventRefId) {
        super.dependency = raisedEventRefId;
    }
}
