import { RaisedEventStack } from "./raised-event-stack.mjs";
import { RaisedEvent } from "./raised-event.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class RaisedEventPublisher extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} raisedEventStackRefId
     */
    constructor(raisedEventRefId, raisedEventStackRefId) {
        super(`raised_${raisedEventRefId.name}_publisher`);
        super.addReference(raisedEventRefId, RaisedEvent.prototype);
        super.addReference(raisedEventStackRefId, RaisedEventStack.prototype);
    }
    publish() {
        const raisedEvent = super.getReference(RaisedEvent.prototype);
        const raisedEventStack = super.getReference(RaisedEventStack.prototype);
        raisedEventStack.unshift(raisedEvent.Id);
    }
}