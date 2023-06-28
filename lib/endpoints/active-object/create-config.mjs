const members = new WeakMap();
export class CreateConfig {
    name = 'active-object-config-create';
    isRoot = false;
    requestTemplate = { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false };
    constructor({ utils, store }) {
        members.set(this, { store });
        members.set(this, { utils });
    }
    async handle({ content }) {
        const { getJSONString } = members.get(this).utils;
        const { writeFileSync, existsSync } = members.get(this).store;
        const fileName = `${this.name}.json`;
        let isValid = true;
        content = getJSONObject(content);
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
            const exists = await existsSync(fileName);
            if (exists) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: getJSONString({ message: `${fileName} already exist.` })
                };
            } else {
                await writeFileSync(fileName, getJSONString(request.content));
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: getJSONString(requestTemplate)
            };
        }
        return {
            contentType: 'application/json',
            statusCode: 200,
            statusMessage: 'Success',
            responseContent: getJSONString({ message: 'success' })
        };
    }
}
