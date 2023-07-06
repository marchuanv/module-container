import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
export class GetConfigEndpoint extends Container {
    constructor({ path, token }) {
        super();
        this.dependency({
            path,
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
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/config\/get/g;
        return pathMatch.test(path);
    }
    async handle() {
        if ((await this.store.exists())) {
            let content = await this.store.read();
            content = this.utils.getJSONObject(content);
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent: this.utils.getJSONString({ message: 'Success', content })
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
