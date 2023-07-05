import { Container, Store } from '../../registry.mjs';
export class CreateConfigEndpoint extends Container {
    constructor({ path, content, token }) {
        super();
        this.bag.path = path;
        this.bag.content = content;
        this.addDependency({ Class: Store, args: { branchName: 'testing', filePath: 'active-object-config.json', token } });
    }
    matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/config\/create/g;
        return pathMatch.test(path);
    }
    async handle() {
        const { content } = this.bag;
        const requestTemplate = { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false };
        let isValid = true;
        content = (await this.utils).getJSONObject(content);
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
            if ((await (await this.store).exists())) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: (await this.utils).getJSONString({ message: `file already exist` })
                };
            } else {
                await (await this.store).write({ content: (await this.utils).getJSONString(content) });
                return {
                    contentType: 'application/json',
                    statusCode: 200,
                    statusMessage: '200 Success',
                    responseContent: (await this.utils).getJSONString({ message: `file was created` })
                };
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: (await this.utils).getJSONString(requestTemplate)
            };
        }
    }
}
