import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
import vm from 'vm'
export class CreateClassEndpoint extends Container {
    constructor({ path, content, token }) {
        super();
        this.dependency({
            path,
            content,
            store: {
                Store,
                ctorArgs: {
                    branchName: 'testing',
                    filePath: 'active-object-class.js',
                    token
                }
            },
            utils,
            vm
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
                    responseContent: this.utils.getJSONString({ message: `file already exist` })
                };
            } else {
                try {
                    let context = {};
                    await this.vm.createContext(context);
                    const vmScript = new this.vm.Script(this.content);
                    vmScript.runInContext(context);
                    await this.store.write({ content });
                    return {
                        contentType: 'application/json',
                        statusCode: 200,
                        statusMessage: '200 Success',
                        responseContent: this.utils.getJSONString({ message: `file was created` })
                    };
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
