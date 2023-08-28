import { RaisedEventReference } from "./references/raised-event-reference.mjs";
import { ReferenceId } from "./references/referenceId.mjs";
export class RaisedEvent extends RaisedEventReference {
    /**
     * @param {String} name
     * @param {ReferenceId} memberEventRefId
     */
    constructor(name, memberEventRefId) {
        super(name)
        super.dependency = memberEventRefId;
        const container = super.memberEvent.memberInfo.container;
        this.date = new Date();
        this.microTime = process.hrtime.bigint();
        this.containerName = container.name;
        this.containerId = container.Id;
    }
}