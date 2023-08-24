import { MemberSubscriberReference } from "./member-event-subscriber-reference.mjs";
import { MemberReference } from "./member-reference.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventSubscriber {
    /**
     * @param {MemberEventReference} memberEventReference
     * @param {MemberReference} memberReference
     */
    constructor(memberEventReference, memberReference) {
        const Id = utils.generateGUID();
        const name = `${memberEventReference.name}_subscriber`;
        new MemberSubscriberReference({
            Id, name, object: this, reference: {
                memberEventReference,
                memberReference
            }, bag: {
                callback: () => {
                    console.log('no subscribers');
                }
            }
        });
    }
    /**
     * @param { Function } callback 
     */
    subscribe(callback) {
        Reference.bag(this).callback = callback;
    }
    async callback({ data }) {
        const callback = Reference.bag(this).callback;
        const member = MemberReference.member(this);
        await callback.call(member, { data });
    }
}