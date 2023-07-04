import { Container } from '../../registry.mjs';
export class DeleteClassEndpoint {
    name = 'active-object-class-delete';
    version = 1;
    async handle() {
        const { $store, $utils } = new Container();
        const filePath = `active-object-class.js`;
        if ((await $store.exists({ filePath }))) {
            await $store.remove({ filePath });
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: '200 Success',
                responseContent: $utils.getJSONString({ message: `${filePath} was removed` })
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
