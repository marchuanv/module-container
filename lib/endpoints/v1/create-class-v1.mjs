import { Container } from '../../registry.mjs';
const args = new WeakMap();
export class CreateClassEndpoint {
    constructor({ path, content, headers }) {
        args.set(this, { path, content, headers });
    }
    matchPath() {
        const { path } = args.get(this);
        const pathMatch = /\/api\/v1\/class\/create/g;
        return pathMatch.test(path);
    }
    async handle() {
        const { content } = args.get(this);
        const { $store, $utils, $vm, $logging } = new Container();
        const filePath = `active-object-class.js`;
        if (content && typeof content === 'string') {
            if ((await $store.exists({ filePath }))) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: $utils.getJSONString({ message: `${filePath} already exist` })
                };
            } else {
                try {
                    let context = {};
                    $vm.createContext(context);
                    const vmScript = new $vm.Script(content);
                    vmScript.runInContext(context);
                    await $store.write({ filePath, data: content });
                    return {
                        contentType: 'application/json',
                        statusCode: 200,
                        statusMessage: '200 Success',
                        responseContent: $utils.getJSONString({ message: `${filePath} was created` })
                    };
                } catch (error) {
                    $logging.log({ error });
                    return {
                        contentType: 'application/json',
                        statusCode: 400,
                        statusMessage: '400 Bad Request',
                        responseContent: $utils.getJSONString({ message: 'request body is not valid java script' })
                    };
                }
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: $utils.getJSONString({ message: 'request body was not provided' })
            };
        }
    }
}
