import { Container, Store } from '../../registry.mjs';
export class GetConfigEndpoint extends Container {
    constructor({ path, token }) {
        super();
        this.bag.path = path;
       this.dependency({ Class: Store, args: { branchName: 'testing', filePath: 'active-object-config.json', token } });
    }
    matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/config\/get/g;
        return pathMatch.test(path);
    }
    async handle() {
        if ((await (await this.store).exists())) {
            let content = await (await this.store).read();
            content = (await this.utils).getJSONObject(content);
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent: (await this.utils).getJSONString({ message: 'Success', content })
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: (await this.utils).getJSONString({ message: `file was not found` })
            };
        }
    }
}
