import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
export class CreateConfigEndpoint extends Container {
    constructor({ path, content, token }) {
        super();
        this.dependency({
            path,
            content,
            Store,
            ctorArgs: {
                branchName: 'testing',
                filePath: 'active-object-config.json',
                token
            },
            utils
        });
    }
    matchPath() {
        const pathMatch = /\/api\/v1\/config\/create/g;
        return pathMatch.test(this.path);
    }
    async handle() {
        const requestTemplate = { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false };
        let isValid = true;
        let content = this.utils.getJSONObject(this.content);
        if (content) {
            for (const prop of Object.keys(requestTemplate)) {
                if (this.content[prop] === undefined) {
                    isValid = false;
                    break;
                }
            }
        } else {
            isValid = false;
        }
        if (isValid) {
            if ((await this.store.exists())) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: this.utils.getJSONString({ message: `file already exist` })
                };
            } else {
                await this.store.write({ content: this.utils.getJSONString(content) });
                return {
                    contentType: 'application/json',
                    statusCode: 200,
                    statusMessage: '200 Success',
                    responseContent: this.utils.getJSONString({ message: `file was created` })
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
