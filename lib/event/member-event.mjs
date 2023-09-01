import { MemberInfo } from "../member-info/member-info.mjs";
import { Reference } from "../reference/reference.mjs";
import { ReferenceId } from "../reference/referenceId.mjs";
export class MemberEvent extends Reference {
    /**
    * @param {ReferenceId} memberInfoRefId
    */
    constructor(
        memberInfoRefId
    ) {
        super(`${memberInfoRefId.name}_event`);
        super.addReference(memberInfoRefId, MemberInfo.prototype);
    }
}