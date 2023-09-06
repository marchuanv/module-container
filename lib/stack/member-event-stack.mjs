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
    }
    /**
     * @param { ReferenceId } subscriberRefId,
     * @param { ReferenceId } memberEventRefId,
     * @param { Boolean } isPublisher,
     * @param { Function<MemberEvent> } callback
     */
    onShift(subscriberRefId, memberEventRefId, isPublisher, callback) {
        if (privateBag.has(subscriberRefId)) {
            privateBag.get(subscriberRefId).callbacks.push(callback);
        } else {
            privateBag.set(subscriberRefId, { isPublisher, callbacks: [callback] });
        }
        if (privateBag.has(memberEventRefId)) {
            privateBag.get(memberEventRefId).push(subscriberRefId);
        } else {

            privateBag.set(memberEventRefId, [subscriberRefId]);
        }
    }
    /**
     * @return { MemberEvent }
     */
    shift() {
        return new Promise(async (resolve) => {
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
                        //somewhere on the stack we need to check if a public member was called that would have internally called the private member
                        if (prevEventClassMember.memberInfo.isPublic && classMemberInfo.Id === prevEventClassMember.classMemberInfo.Id) {
                            isPrivate = false;
                        }
                        prevMemberEvent = super.shiftStack(MemberEvent.prototype);
                    }
                }
                if (isPrivate) {
                    memberEvent.error = new Error(`${memberInfo.name} is private or not called from a valid context`);
                }
                resolve(memberEvent);
            } else {
                resolve();
            }
        });
    }
    reset() {
        return super.resetStack(MemberEvent.prototype);
    }
    /**
     * @param {ReferenceId} memberEventRefId
     */
    async unshift(memberEventRefId) {
        super.addReference(memberEventRefId, MemberEvent.prototype);
        let memberEvent = await this.shift();
        while (memberEvent) {
            await notifySubscribers(memberEvent);
            await notifyPublishers(memberEvent);
            memberEvent = await this.shift();
        }
    }
}
async function notifySubscribers(memberEvent) {
    let { callbacks } = privateBag.get(memberEvent.Id).map(subscriberRefId => privateBag.get(subscriberRefId)).find(x => !x.isPublisher);
    for (const callback of callbacks) {
        await callback(memberEvent); //this might trigger another event
    }
}
async function notifyPublishers(memberEvent) {
    let { callbacks } = privateBag.get(memberEvent.Id).map(subscriberRefId => privateBag.get(subscriberRefId)).find(x => x.isPublisher);
    for (const callback of callbacks) {
        await callback(memberEvent); //this might trigger another event
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