import { Container } from '../../registry.mjs';
export class CreateConfig extends Container {
    name = 'active-object-config-create';
    isRoot = false;
    requestTemplate = { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false };
    async handle({ content }) {
        const fileName = `${this.name}.json`;
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
            if ((await $store.exists(fileName))) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: $utils.getJSONString({ message: `${fileName} already exist.` })
                };
            } else {
                await writeFileSync(fileName, $utils.getJSONString(content));
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: $utils.getJSONString(requestTemplate)
            };
        }
        return {
            contentType: 'application/json',
            statusCode: 200,
            statusMessage: 'Success',
            responseContent: $utils.getJSONString({ message: 'success' })
        };
    }
}
