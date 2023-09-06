import { MemberEvent } from '../event/member-event.mjs';
import { ClassMemberInfo } from '../member-info/class-member-info.mjs';
import { MethodMemberInfo } from '../member-info/method-member-info.mjs';
import { ReferencePropertyMemberInfo } from '../member-info/reference-property-member-info.mjs';
import { StaticPropertyMemberInfo } from '../member-info/static-property-member-info.mjs';
import { MethodMember } from '../member/method-member.mjs';
import { ReferencePropertyMember } from '../member/reference-property-member.mjs';
import { StaticPropertyMember } from '../member/static-property-member.mjs';
import { Reference } from '../reference/reference.mjs';
import { ReferenceId } from '../reference/referenceId.mjs';
const privateBag = new WeakMap();
export class MemberEventStack extends Reference {
    constructor() {
        super('membereventstack');
        privateBag.set(this, { callbacks: [] });
    }
    /**
    * @param { Function<MemberEvent> } callback
    */
    onShift(callback) {
        const { callbacks } = privateBag.get(this);
        callbacks.push(callback);
    }
    /**
     * @return { MemberEvent }
     */
    shift() {
        const { callbacks } = privateBag.get(this);
        let memberEvent = super.shiftStack(MemberEvent.prototype);
        let isPrivate = true;
        if (memberEvent) {
            const { memberInfo, classMemberInfo } = getMembersInfo.call(this, memberEvent);
            if (memberInfo.isPublic) {
                isPrivate = false;
            } else {
                super.resetStack(MemberEvent.prototype);
                memberEvent = super.shiftStack(MemberEvent.prototype);
                let prevMemberEvent = super.shiftStack(MemberEvent.prototype);
                while (prevMemberEvent) {
                    let prevEventClassMember = getMembersInfo.call(this, prevMemberEvent);
                    if (prevEventClassMember.memberInfo.isPublic && classMemberInfo.Id === prevEventClassMember.classMemberInfo.Id) {
                        isPrivate = false;
                    }
                    prevMemberEvent = super.shiftStack(MemberEvent.prototype);
                }
            }
            for (const callback of callbacks) {
                if (isPrivate) {
                    memberEvent.error = new Error(`${memberInfo.name} is private or not called from a valid context`);
                }
                callback(memberEvent);
            }
        }
        return memberEvent;
    }
    reset() {
        return super.resetStack(MemberEvent.prototype);
    }
    /**
     * @param {ReferenceId} memberEventRefId
     */
    unshift(memberEventRefId) {
        super.addReference(memberEventRefId, MemberEvent.prototype);
    }
    raiseEvents() {
        setInterval(() => {
            let event = this.shift();
            while (event) {
                event = this.shift();
            }
        }, 1000)
    }
}
/**
 * @param {MemberEvent} memberEvent 
 */
function getMembersInfo(memberEvent) {
    const member = memberEvent.getReference(ReferencePropertyMember.prototype) ||
        memberEvent.getReference(StaticPropertyMember.prototype) ||
        memberEvent.getReference(MethodMember.prototype);
    const memberInfo = member.getReference(ReferencePropertyMemberInfo.prototype) ||
        member.getReference(StaticPropertyMemberInfo.prototype) ||
        member.getReference(MethodMemberInfo.prototype);
    const classMemberInfo = memberInfo.getReference(ClassMemberInfo.prototype);
    return {
        member,
        memberInfo,
        classMemberInfo
    };
}