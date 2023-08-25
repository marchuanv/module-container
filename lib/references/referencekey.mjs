export class ReferenceKey {
    /**
     * @param {String} Id
     * @param {String} name
     * @param {Array<ReferenceKey>} dependantKeys 
     */
    constructor(Id, name, dependantKeys) {
        this._id = Id;
        this._name = name;
        this._dependantKeys = dependantKeys;
    }
    /**
     * @returns { String }
     */
    get Id() {
        return this._id;
    }
    /**
     * @returns { String }
     */
    get name() {
        return this._name;
    }
    /**
     * @returns { Array }
     */
    get dependantKeys() {
        return this._dependantKeys;
    }
}