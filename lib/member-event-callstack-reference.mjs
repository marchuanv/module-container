import { MemberEventCallStack } from "./member-event-callstack.mjs";
import { Reference } from "./reference.mjs";
export class MemberEventCallstackReference extends Reference {
    constructor({ Id, name, object, reference = null, bag = {} }) {
        if (!(object instanceof MemberEventCallStack)) {
            throw new Error(`object is not an instance of ${Member.name}`);
        }
        super({ Id, name, object, reference, bag });
    }
    /**
     * @returns { MemberEventCallStack }
     */
    static callstack(context) {
        return Reference.object(context);
    }
}      