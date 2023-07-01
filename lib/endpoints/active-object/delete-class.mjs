import { Container } from "../../container.mjs";
export class DeleteClass extends Container {
    name = 'active-object-class-delete';
    isRoot = false;
    async handle() {
        const fileName = `${this.name}.js`;
        if ((await $store.exists(fileName))) {
            await $store.remove(fileName);
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: 'Success',
                responseContent: $utils.getJSONString({ message: 'success' })
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
