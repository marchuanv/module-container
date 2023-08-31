import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { RaisedEventStack } from "../stack/raised-event-stack.mjs";
import { RaisedEvent } from "./raised-event.mjs";
export class RaisedEventPublisher extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} raisedEventStackRefId
     */
    constructor(raisedEventRefId, raisedEventStackRefId) {
        super(`${raisedEventRefId.name}_publisher`);
        super.addReference(raisedEventRefId, RaisedEvent.prototype);
        super.addReference(raisedEventStackRefId, RaisedEventStack.prototype);
    }
    /**
     * @param { Object } data
     */
    publish(data) {
        const thisRaisedEvent = super.getReference(RaisedEvent.prototype);
        thisRaisedEvent.data = data;
        const raisedEventStack = super.getReference(RaisedEventStack.prototype);
        raisedEventStack.unshift(thisRaisedEvent.Id);
    }
}