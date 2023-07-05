import { Container, Store } from '../../registry.mjs';
export class CreateClassEndpoint extends Container {
    constructor({ path, content, token }) {
        super();
        this.bag.path = path;
        this.bag.content = content;
       this.dependency({ Class: Store, args: { branchName: 'testing', filePath: `active-object-class.js`, token } });
    }
    matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/class\/create/g;
        return pathMatch.test(path);
    }
    async handle() {
        const { content } = this.bag;
        if (content && typeof content === 'string') {
            if ((await (await this.store).exists())) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: (await this.utils).getJSONString({ message: `file already exist` })
                };
            } else {
                try {
                    let context = {};
                    (await this.vm).createContext(context);
                    const vmScript = new (await this.vm).Script(content);
                    vmScript.runInContext(context);
                    await (await this.store).write({ content });
                    return {
                        contentType: 'application/json',
                        statusCode: 200,
                        statusMessage: '200 Success',
                        responseContent: (await this.utils).getJSONString({ message: `file was created` })
                    };
                } catch ({ message }) {
                    return {
                        contentType: 'application/json',
                        statusCode: 400,
                        statusMessage: '400 Bad Request',
                        responseContent: (await this.utils).getJSONString({ message })
                    };
                }
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: (await this.utils).getJSONString({ message: 'request body was not provided' })
            };
        }
    }
}
