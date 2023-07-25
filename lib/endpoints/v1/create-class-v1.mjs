import { Container, Store, Session } from '../../registry.mjs';
import utils from 'utils'
import vm from 'vm'
export class CreateClassEndpoint extends Container {
    constructor({ path, authToken, storeAuthToken }) {
        const filePath = 'active-object-class.js';
        super({
            members: {
                path: {
                    value: path
                },
                content: {
                    value: content
                },
                store: {
                    class: { Store },
                    args: {
                        filePath,
                        storeAuthToken
                    }
                },
                session: {
                    class: { Session },
                    args: { authToken }
                },
                filePath: {
                    value: filePath
                },
                utils: {
                    value: utils
                },
                vm: {
                    value: vm
                }
            }
        });
    }
    async matchPath() {
        const path = await this.path;
        const pathMatch = /\/api\/v1\/class\/create/g;
        return pathMatch.test(path);
    }
    async handle() {
        const session = await this.session;
        if ((await session.isAuthorised())) {

            const store = await this.store;
            const utils = await this.utils;
            const filePath = await this.filePath;
            const vm = await this.vm;
            let content = await this.content;

            if (content && typeof content === 'string') {
                if ((await store.exists())) {
                    return {
                        contentType: 'application/json',
                        statusCode: 409,
                        statusMessage: '409 Conflict',
                        responseContent: utils.getJSONString({ message: `${filePath} already exist` })
                    };
                } else {
                    try {
                        let context = {};
                        await vm.createContext(context);
                        const vmScript = new vm.Script(content);
                        vmScript.runInContext(context);
                        if ((await store.write({ content }))) {
                            return {
                                contentType: 'application/json',
                                statusCode: 200,
                                statusMessage: '200 Success',
                                responseContent: utils.getJSONString({ message: `${filePath} was created` })
                            };
                        } else {
                            return {
                                contentType: 'application/json',
                                statusCode: 500,
                                statusMessage: '500 Internal Server Error',
                                responseContent: utils.getJSONString({ message: `${filePath} was not created` })
                            };
                        }
                    } catch ({ message }) {
                        return {
                            contentType: 'application/json',
                            statusCode: 400,
                            statusMessage: '400 Bad Request',
                            responseContent: utils.getJSONString({ message })
                        };
                    }
                }
            } else {
                return {
                    contentType: 'application/json',
                    statusCode: 400,
                    statusMessage: '400 Bad Request',
                    responseContent: utils.getJSONString({ message: 'request body was not provided' })
                };
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 401,
                statusMessage: '401 Unauthorised',
                responseContent: utils.getJSONString({ message: 'request is not authorised' })
            };
        }
    }
}
