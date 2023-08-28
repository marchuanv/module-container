import { MemberEventPublisherReference } from "./references/member-event-publisher-reference.mjs";
import { ReferenceId } from "./references/referenceId.mjs";
export class MemberEventPublisher extends MemberEventPublisherReference {
    /**
     * @param {String} name
     * @param {ReferenceId} memberEventRefId
     * @param {ReferenceId} memberEventQueueRefId
     */
    constructor(name, memberEventRefId, memberEventQueueRefId) {
        super(name);
        super.dependency = memberEventRefId;
        super.dependency = memberEventQueueRefId;
    }
    /**
     * @param { Function } callback
     */
    async publish({ }) {
        throw new Error('not implemented');
    }
}