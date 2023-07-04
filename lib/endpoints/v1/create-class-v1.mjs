import { Container, Logging, Store } from '../../registry.mjs';
export class CreateClassEndpoint extends Container {
    constructor({ path, content, headers }) {
        super();
        this.bag.path = path;
        this.bag.content = content;
        this.bag.headers = headers;
        this.register({ Class: Store });
        this.register({ Class: Logging });
    }
    matchPath() {
        const { path } = this.bag;
        const pathMatch = /\/api\/v1\/class\/create/g;
        return pathMatch.test(path);
    }
    async handle() {
        const { content } = this.bag;
        const filePath = `active-object-class.js`;
        if (content && typeof content === 'string') {
            if ((await this.store.exists({ filePath }))) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: this.utils.getJSONString({ message: `${filePath} already exist` })
                };
            } else {
                try {
                    let context = {};
                    this.vm.createContext(context);
                    const vmScript = new this.vm.Script(content);
                    vmScript.runInContext(context);
                    await this.store.write({ filePath, data: content });
                    return {
                        contentType: 'application/json',
                        statusCode: 200,
                        statusMessage: '200 Success',
                        responseContent: this.utils.getJSONString({ message: `${filePath} was created` })
                    };
                } catch (error) {
                    this.logging.log({ error });
                    return {
                        contentType: 'application/json',
                        statusCode: 400,
                        statusMessage: '400 Bad Request',
                        responseContent: this.utils.getJSONString({ message: 'request body is not valid java script' })
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
