import { MethodMember } from "../member/method-member.mjs";
import { ReferencePropertyMember } from "../member/reference-property-member.mjs";
import { StaticPropertyMember } from "../member/static-property-member.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
import { MemberEvent } from "./member-event.mjs";
const privateBag = new WeakMap();
export class RaisedEvent extends Reference {
    /**
     * @param {ReferenceId} memberEventRefId
     * @param {Object} data
     */
    constructor(memberEventRefId) {
        super(`raised_${memberEventRefId.name}`);
        super.addReference(memberEventRefId, MemberEvent.prototype);
        const memberEvent = super.getReference(MemberEvent.prototype);
        let member = memberEvent.getReference(ReferencePropertyMember.prototype) ||
            memberEvent.getReference(StaticPropertyMember.prototype) ||
            memberEvent.getReference(MethodMember.prototype);
        const microTime = process.hrtime.bigint();
        const containerName = container.name;
        const containerId = container.Id;
        const date = new Date();
        privateBag.set(this, {
            microTime,
            containerName,
            containerId,
            date
        });
    }
    /**
     * @returns {ReferenceId}
     */
    get memberEventId() {
        const memberEvent = super.getReference(MemberEvent.prototype);
        return memberEvent.Id;
    }
}