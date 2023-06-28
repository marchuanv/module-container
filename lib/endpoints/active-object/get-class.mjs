const members = new WeakMap();
export class GetClass {
    name = 'active-object-class-get';
    isRoot = false;
    constructor({ utils, store }) {
        members.set(this, { store });
        members.set(this, { utils });
    }
    async handle() {
        const { getJSONString } = members.get(this).utils;
        const { readFileSync, existsSync } = members.get(this).store;
        const fileName = `${this.name}.js`;
        const exists = await existsSync(fileName);
        if (exists) {
            let content = await readFileSync(fileName);
            content = getJSONObject(content);
            return {
                contentType: 'text/javascript',
                statusCode: 200,
                statusMessage: 'Success',
                responseContent: getJSONString(content)
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
