const Ids = new WeakMap();
export class ReferenceId {
    /**
     * @param {String} Id
     * @param {String} name
     */
    constructor(Id, name) {
        Ids.set(this, { Id, name });
    }
    /**
     * @returns { String }
     */
    get Id() {
        const { Id } = Ids.get(this);
        return Id;
    }
    /**
     * @returns { String }
     */
    get name() {
        const { name } = Ids.get(this);
        return name;
    }
}