const members = new WeakMap();
export class DeleteConfig {
    name = 'active-object-config-delete';
    isRoot = false;
    constructor({ utils, store }) {
        members.set(this, { store });
        members.set(this, { utils });
    }
    async handle() {
        const { getJSONString } = members.get(this).utils;
        const { rmSync, existsSync } = members.get(this).store;
        const fileName = `${this.name}.json`;
        const exists = await existsSync(fileName);
        if (exists) {
            await rmSync(fileName);
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: 'Success',
                responseContent: getJSONString({ message: 'success' })
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: getJSONString({ message: '404 Not Found' })
            };
        }
    }
}
