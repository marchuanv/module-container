import { Container, Store } from '../../registry.mjs';
export class GetClassEndpoint extends Container {
    constructor({ path, content, headers }) {
        super();
        this.bag.path = path;
        this.bag.content = content;
        this.bag.headers = headers;
        this.register({ Class: Store });
    }
    matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/class\/get/g;
        return pathMatch.test(path);
    }
    async handle() {
        const filePath = `active-object-class.js`;
        if ((await this.store.exists({ filePath }))) {
            let content = await this.store.read({ filePath });
            let responseContent = this.utils.getJSONString({ message: 'Success', content });
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
                responseContent: this.utils.getJSONString({ message: `${filePath} was not found` })
            };
        }
    }
}
