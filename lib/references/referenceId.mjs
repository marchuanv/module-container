export class ReferenceId {
    /**
     * @param {String} Id
     */
    constructor(Id) {
        this._id = Id;
    }
    /**
     * @returns { String }
     */
    get Id() {
        return this._id;
    }
}