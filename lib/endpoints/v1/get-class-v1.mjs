import { Container, Store } from '../../registry.mjs';
import utils from 'utils'
export class GetClassEndpoint extends Container {
    constructor({ path, token }) {
        super();
        this.dependency({
            path,
            Store,
            ctorArgs: {
                branchName: 'testing',
                filePath: 'active-object-class.js',
                token
            },
            utils
        });
    }
    matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/class\/get/g;
        return pathMatch.test(path);
    }
    async handle() {
        if ((await this.store.exists())) {
            let content = await this.store.read();
            let responseContent = this.utils.getJSONString({ message: 'Success', content });
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent
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
