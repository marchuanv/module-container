import utils from "utils";
import { MemberEventReference } from "./references/member-event-reference.mjs";
import { RaisedMemberEventReference } from "./references/raised-member-event-reference.mjs";
export class RaisedMemberEvent extends RaisedMemberEventReference {
    /**
     * 
     * @param {MemberEventReference} memberEvent 
     */
    constructor() {
        const memberInfo = MemberEventReference.reference.memberReference.memberInfoReference.memberInfoReference.memberInfo;
        const container = MemberEventReference.reference.memberReference.memberInfoReference.memberInfoReference.containerReference.container;
        this.date = new Date();
        this.microTime = process.hrtime.bigint();
        this.name = memberInfo.name;
        this.Id = memberInfo.Id;
        this.containerName = container.name;
        this.containerId = container.Id;
    }
}