import { Reference } from "./reference/reference.mjs";
import { ReferenceId } from "./reference/referenceId.mjs";
export class MemberEventPublisher extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} memberEventQueueRefId
     */
    constructor(memberEventRefId, memberEventQueueRefId) {
        super(`${memberEventRefId.name}_publisher`);
        this.dependency = memberEventRefId;
        this.dependency = memberEventQueueRefId;
    }
    /**
     * @param { Object } data
     */
    async publish(data) {
        throw new Error('not implemented');
    }
}