import { Container } from "./container.mjs";
import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
const privateBag = new WeakMap();
export class RaisedEvent extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     */
    constructor(memberEventRefId) {
        const name = `${memberEventRefId.name}_raised`;
        super(name);
        this.dependency = memberEventRefId;
        const container = this.get(Container.prototype);
        const microTime = process.hrtime.bigint();
        const containerName = container.name;
        const containerId = container.Id;
        const date = new Date();
        privateBag.set(this, {
            name,
            microTime,
            containerName,
            containerId,
            date
        });
    }
}