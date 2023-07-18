import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
export class CreateConfigEndpoint extends Container {
    constructor({ path, content, token }) {
        const filePath = 'active-object-config.json';
        super({
            path: {
                name: 'path',
                value: path
            },
            content: {
                name: 'content',
                value: content
            },
            store: {
                type: Store,
                args: {
                    branchName: 'testing',
                    filePath,
                    token
                }
            },
            filePath: {
                name: 'filePath',
                value: filePath
            },
            utils: {
                name: 'utils',
                value: utils
            }
        });
    }
    async matchPath() {
        const pathMatch = /\/api\/v1\/config\/create/g;
        return pathMatch.test(this.path);
    }
    async handle() {
        const requestTemplate = { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false };
        let isValid = true;
        let content = this.utils.getJSONObject(this.content);
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
            if ((await this.store.exists())) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: this.utils.getJSONString({ message: `${this.filePath} already exist` })
                };
            } else {
                if ((await this.store.write({ content: this.content }))) {
                    return {
                        contentType: 'application/json',
                        statusCode: 200,
                        statusMessage: '200 Success',
                        responseContent: this.utils.getJSONString({ message: `${this.filePath} was created` })
                    };
                } else {
                    return {
                        contentType: 'application/json',
                        statusCode: 500,
                        statusMessage: '500 Internal Server Error',
                        responseContent: this.utils.getJSONString({ message: `${this.filePath} was not created` })
                    };
                }
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
