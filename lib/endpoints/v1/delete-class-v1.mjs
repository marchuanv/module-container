import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
export class DeleteClassEndpoint extends Container {
    constructor({ path, token }) {
        const filePath = 'active-object-class.js';
        super({
            path: {
                name: 'path',
                value: path
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
            }
        });
    }
    async matchPath() {
        const pathMatch = /\/api\/v1\/class\/delete/g;
        return pathMatch.test(this.path);
    }
    async handle() {
        if ((await this.store.exists())) {
            if ((await this.store.remove())) {
                return {
                    contentType: 'application/json',
                    statusCode: 200,
                    statusMessage: '200 Success',
                    responseContent: this.utils.getJSONString({ message: `${this.filePath} was removed` })
                };
            } else {
                return {
                    contentType: 'application/json',
                    statusCode: 500,
                    statusMessage: '500 Internal Server Error',
                    responseContent: this.utils.getJSONString({ message: `${this.filePath} was not removed` })
                };
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: this.utils.getJSONString({ message: `${this.filePath} was not found` })
            };
        }
    }
}
