const members = new WeakMap();
export class GetClass {
    name = 'active-object-class-get';
    isRoot = false;
    constructor({ utils, store }) {
        members.set(this, { store, utils });
    }
    async handle() {
        const { utils, store } = members.get(this);
        const fileName = `${this.name}.js`;
        if ((await store.exists(fileName))) {
            let content = await store.readFile(fileName);
            content = utils.getJSONObject(content);
            return {
                contentType: 'text/javascript',
                statusCode: 200,
                statusMessage: 'Success',
                responseContent: utils.getJSONString(content)
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: utils.getJSONString({ message: '404 Not Found' })
            };
        }
    }
}
