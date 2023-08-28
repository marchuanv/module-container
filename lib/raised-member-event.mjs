import { RaisedMemberEventReference } from "./references/raised-member-event-reference.mjs";
import { ReferenceId } from "./references/referenceId.mjs";
export class RaisedMemberEvent extends RaisedMemberEventReference {
    /**
     * @param {String} name
     * @param {ReferenceId} memberRefId
     * @param {ReferenceId} containerRefId
     */
    constructor(name, memberRefId, containerRefId) {
        super(name)
        super.dependency = memberRefId;
        super.dependency = containerRefId;
        const container = super.container;
        this.date = new Date();
        this.microTime = process.hrtime.bigint();
        this.containerName = container.name;
        this.containerId = container.Id;
    }
}