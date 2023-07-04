import { Container, Store } from '../../registry.mjs';
export class DeleteConfigEndpoint extends Container {
    constructor({ path, content, headers }) {
        super();
        this.bag.path = path;
        this.bag.content = content;
        this.bag.headers = headers;
        this.register({ Class: Store });
    }
    matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/config\/delete/g;
        return pathMatch.test(path);
    }
    async handle() {
        const filePath = `active-object-config.json`;
        if ((await this.store.exists({ filePath }))) {
            await this.store.remove({ filePath });
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent: this.utils.getJSONString({ message: `${filePath} was removed` })
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: this.utils.getJSONString({ message: `${filePath} was not found` })
            };
        }
    }
}
