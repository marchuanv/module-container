import { Container } from '../../registry.mjs';
const args = new WeakMap();
export class DeleteConfigEndpoint {
    constructor({ path, content, headers }) {
        args.set(this, { path, content, headers });
    }
    matchPath() {
        const { path } = args.get(this);
        const pathMatch = /\/api\/v1\/config\/delete/g;
        return pathMatch.test(path);
    }
    async handle() {
        const { $store, $utils } = new Container();
        const filePath = `active-object-config.json`;
        if ((await $store.exists({ filePath }))) {
            await $store.remove({ filePath });
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent: $utils.getJSONString({ message: `${filePath} was removed` })
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
