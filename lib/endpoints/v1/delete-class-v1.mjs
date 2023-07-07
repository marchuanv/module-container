import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
export class DeleteClassEndpoint extends Container {
    constructor({ path, token }) {
        super();
        this.dependency({
            path,
            store: {
                Store,
                ctorArgs: {
                    branchName: 'testing',
                    filePath: 'active-object-class.js',
                    token
                }
            },
            utils
        });
    }
    async matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/class\/delete/g;
        return pathMatch.test(path);
    }
    async handle() {
        if ((await this.store.exists())) {
            await this.store.remove();
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent: this.utils.getJSONString({ message: `file was removed` })
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: this.utils.getJSONString({ message: `file was not found` })
            };
        }
    }
}
