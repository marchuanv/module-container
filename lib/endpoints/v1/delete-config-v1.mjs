import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
export class DeleteConfigEndpoint extends Container {
    constructor({ path, token }) {
        super({
            path,
            store: {
                Store,
                ctorArgs: {
                    branchName: 'testing',
                    filePath: 'active-object-config.json',
                    token
                }
            },
            utils
        });
    }
    async matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/config\/delete/g;
        return pathMatch.test(path);
    }
    async handle() {
        if ((await this.store.exists())) {
            await this.store.remove();
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent: this.utils.getJSONString({ message: `${this.filePath} was removed` })
            };
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
