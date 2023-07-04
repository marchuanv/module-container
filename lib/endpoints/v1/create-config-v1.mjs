import { Container, Store } from '../../registry.mjs';
export class CreateConfigEndpoint extends Container {
    constructor({ path, content, headers }) {
        super();
        this.bag.path = path;
        this.bag.content = content;
        this.bag.headers = headers;
        this.register({ Class: Store });
    }
    matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/config\/create/g;
        return pathMatch.test(path);
    }
    async handle() {
        const { content } = this.bag;
        const requestTemplate = { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false };
        const filePath = 'active-object-config.json';
        let isValid = true;
        content = this.utils.getJSONObject(content);
        if (content) {
            for (const prop of Object.keys(requestTemplate)) {
                if (content[prop] === undefined) {
                    isValid = false;
                    break;
                }
            }
        } else {
            isValid = false;
        }
        if (isValid) {
            if ((await this.store.exists({ filePath }))) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: this.utils.getJSONString({ message: `${filePath} already exist` })
                };
            } else {
                await this.store.write({ filePath, data: this.utils.getJSONString(content) });
                return {
                    contentType: 'application/json',
                    statusCode: 200,
                    statusMessage: '200 Success',
                    responseContent: this.utils.getJSONString({ message: `${filePath} was created` })
                };
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: this.utils.getJSONString(requestTemplate)
            };
        }
    }
}
