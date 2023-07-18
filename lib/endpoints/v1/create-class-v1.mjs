import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
import vm from 'vm'
export class CreateClassEndpoint extends Container {
    constructor({ path, content, token }) {
        const filePath = 'active-object-class.js';
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
                type: { Store },
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
            },
            vm: {
                name: 'vm',
                value: vm,
            }
        });
    }
    async matchPath() {
        const pathMatch = /\/api\/v1\/class\/create/g;
        return pathMatch.test(this.path);
    }
    async handle() {
        if (this.content && typeof this.content === 'string') {
            if ((await this.store.exists())) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: this.utils.getJSONString({ message: `${this.filePath} already exist` })
                };
            } else {
                try {
                    let context = {};
                    await this.vm.createContext(context);
                    const vmScript = new this.vm.Script(this.content);
                    vmScript.runInContext(context);
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
                } catch ({ message }) {
                    return {
                        contentType: 'application/json',
                        statusCode: 400,
                        statusMessage: '400 Bad Request',
                        responseContent: this.utils.getJSONString({ message })
                    };
                }
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: this.utils.getJSONString({ message: 'request body was not provided' })
            };
        }
    }
}
