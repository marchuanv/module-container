const members = new WeakMap();
export class GetConfig {
    name = 'active-object-config-get';
    isRoot = false;
    constructor({ utils, store }) {
        members.set(this, { store });
        members.set(this, { utils });
    }
    async handle() {
        const { utils: { getJSONString }, store: { readFileSync, existsSync } } = members.get(this);
        const fileName = `${this.name}.json`;
        const exists = await existsSync(fileName);
        if (exists) {
            let content = await readFileSync(fileName);
            content = getJSONObject(content);
            return {
                contentType: 'application/json',
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
