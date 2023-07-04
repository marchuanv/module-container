import { Container } from '../../registry.mjs';
export class CreateConfigEndpoint {
    name = 'active-object-config-create';
    isRoot = false;
    async handle({ content }) {
        const requestTemplate = { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false };
        const { $utils, $store } = new Container();
        const filePath = 'active-object-config.json';
        let isValid = true;
        content = $utils.getJSONObject(content);
        if (content) {
            for (const prop of Object.keys(requestTemplate)) {
                if (content[prop] === undefined) {
                    isValid = false;
                    break;
                }
            }
        } else {
            isValid = false;
        }
        if (isValid) {
            if ((await $store.exists({ filePath }))) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: $utils.getJSONString({ message: `${filePath} already exist` })
                };
            } else {
                await $store.write({ filePath, data: $utils.getJSONString(content) });
                return {
                    contentType: 'application/json',
                    statusCode: 200,
                    statusMessage: '200 Success',
                    responseContent: $utils.getJSONString({ message: `${filePath} was created` })
                };
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: $utils.getJSONString(requestTemplate)
            };
        }
    }
}
