import { Container } from '../../registry.mjs';
const args = new WeakMap();
export class GetClassEndpoint {
    constructor({ path, content, headers }) {
        args.set(this, { path, content, headers });
    }
    matchPath() {
        const { path } = args.get(this);
        const pathMatch = /\/api\/v1\/class\/get/g;
        return pathMatch.test(path);
    }
    async handle() {
        const { $store, $utils } = new Container();
        const filePath = `active-object-class.js`;
        if ((await $store.exists({ filePath }))) {
            let content = await $store.read({ filePath });
            let responseContent = JSON.stringify({ message: 'Success', content });
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: $utils.getJSONString({ message: `${filePath} was not found` })
            };
        }
    }
}
