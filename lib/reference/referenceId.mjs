const Ids = new WeakMap();
export class ReferenceId {
    /**
     * @param {String} Id
     * @param {String} name
     * @param {Object} prototype
     */
    constructor(Id, name, prototype) {
        Ids.set(this, { Id, name, prototype });
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
    /**
    * @returns { Object }
    */
    get prototype() {
        const { prototype } = Ids.get(this);
        return prototype;
    }
}