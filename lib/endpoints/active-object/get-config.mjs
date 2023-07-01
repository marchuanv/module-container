import { Container } from '../../registry.mjs';
export class GetConfig extends Container {
    name = 'active-object-config-get';
    isRoot = false;
    async handle() {
        const fileName = `${this.name}.json`;
        if ((await $store.exists(fileName))) {
            let content = await $store.readFile(fileName);
            content = $utils.getJSONObject(content);
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: 'Success',
                responseContent: $utils.getJSONString(content)
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: $utils.getJSONString({ message: '404 Not Found' })
            };
        }
    }
}
