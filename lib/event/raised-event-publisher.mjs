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
        super.dependency = raisedEventRefId;
        super.dependency = raisedEventStackRefId;
    }
    publish() {
        const raisedEvent = super.get(RaisedEvent.prototype);
        const raisedEventStack = super.get(RaisedEventStack.prototype);
        raisedEventStack.unshift(raisedEvent.Id);
    }
}