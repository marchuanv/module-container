import { Container, Store } from '../../registry.mjs';
export class DeleteClassEndpoint extends Container {
    constructor({ path, token }) {
        super();
        this.bag.path = path;
        this.addDependency({ Class: Store, args: { branchName: 'testing', filePath: 'active-object-class.js', token } });
    }
    matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/class\/delete/g;
        return pathMatch.test(path);
    }
    async handle() {
        if ((await(await this.store).exists())) {
            await (await this.store).remove();
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent: (await this.utils).getJSONString({ message: `file was removed` })
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
