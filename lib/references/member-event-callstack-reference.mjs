import { MemberEventCallStack } from "../member-event-callstack.mjs";
import { MemberEvent } from "../member-event.mjs";
import { Reference } from "./reference.mjs";
import { ReferenceId } from "./referenceId.mjs";
let stackRefId;
export class MemberEventCallStackReference extends Reference {
    /**
    * @param {String} name
    */
    constructor(name) {
        super(name, this, MemberEventCallStack);
        if (!stackRefId) {
            stackRefId = this.setData([]);
        }
    }
    /**
     * @returns { Array<MemberEvent> }
     */
    get memberEvents() {
        const { stack } = this.getData(stackRefId);
        const memberEvents = super.dependencies(MemberEvent);
        for (const stackItem of stack) {
            if (stackItem instanceof ReferenceId) {
                const index = stack.findIndex(si => si === stackItem);
                stack[index] = memberEvents.find(me => me.Id === stackItem.Id);
            }
        }
        return stack;
    }
}