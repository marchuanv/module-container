import { Container } from '../../registry.mjs';
export class GetClassEndpoint {
    name = 'active-object-class-get';
    isRoot = false;
    version: 1;
    async handle() {
        const { $store, $utils } = new Container();
        const filePath = `active-object-class.js`;
        if ((await $store.exists({ filePath }))) {
            let content = await $store.read({ filePath });
            let responseContent = JSON.stringify({ message: 'Success', content });
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
                responseContent: $utils.getJSONString({ message: `${filePath} was not found` })
            };
        }
    }
}
