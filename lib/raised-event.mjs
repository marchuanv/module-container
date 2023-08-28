import { Container } from "./container.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class RaisedEvent extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     */
    constructor(memberEventRefId) {
        super(`${memberEventRefId.name}_raised`);
        this.dependency = memberEventRefId;
        const container = this.get(Container.prototype);
        this.date = new Date();
        this.microTime = process.hrtime.bigint();
        this.containerName = container.name;
        this.containerId = container.Id;
    }
}