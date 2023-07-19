import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
export class DeleteConfigEndpoint extends Container {
    constructor({ path, token }) {
        const filePath = 'active-object-config.json';
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
        const path = await this.path;
        const pathMatch = /\/api\/v1\/config\/delete/g;
        return pathMatch.test(path);
    }
    async handle() {

        const store = await this.store;
        const utils = await this.utils;
        const filePath = await this.filePath;

        if ((await store.exists())) {
            if ((await store.remove())) {
                return {
                    contentType: 'application/json',
                    statusCode: 200,
                    statusMessage: '200 Success',
                    responseContent: utils.getJSONString({ message: `${filePath} was removed` })
                };
            } else {
                return {
                    contentType: 'application/json',
                    statusCode: 500,
                    statusMessage: '500 Internal Server Error',
                    responseContent: utils.getJSONString({ message: `${filePath} was not removed` })
                };
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: utils.getJSONString({ message: `${filePath} was not found` })
            };
        }
    }
}
