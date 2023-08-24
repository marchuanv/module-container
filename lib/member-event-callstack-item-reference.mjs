import { MemberEventCallStackItem } from "./member-event-callstack-item.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventCallstackItemReference extends Reference {
    constructor({ Id, name, object, reference = null, bag = {} }) {
        if (!(object instanceof MemberEventCallStackItem)) {
            throw new Error(`object is not an instance of ${Member.name}`);
        }
        super({ Id, name, object, reference, bag });
    }
    /**
     * @returns { MemberEventCallStackItem }
     */
    static callstackItem(context) {
        return Reference.object(context);
    }
}      