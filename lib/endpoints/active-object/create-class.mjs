const members = new WeakMap();
export class CreateClass {
    name = 'active-object-class-create';
    isRoot = false;
    constructor({ utils, vm, store }) {
        members.set(this, { store });
        members.set(this, { vm });
        members.set(this, { utils });
    }
    async handle({ content }) {
        const { writeFileSync, existsSync } = members.get(this).store;
        const { getJSONString } = members.get(this).utils;
        const { Script } = members.get(this).vm;
        const fileName = `${this.name}.js`;
        if (content && typeof content === 'string') {
            const exists = await existsSync(fileName);
            if (exists) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: getJSONString({ message: `${fileName} already exist.` })
                };
            } else {
                try {
                    const context = {};
                    const vmScript = new Script(content);
                    vmScript.runInContext(context);
                    await writeFileSync(fileName, getJSONString(content));
                } catch {
                    return {
                        contentType: 'application/json',
                        statusCode: 400,
                        statusMessage: '400 Bad Request',
                        responseContent: getJSONString({ message: 'request body is not valid java script' })
                    };
                }
            }
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: 'Success',
                responseContent: getJSONString({ message: 'success' })
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: getJSONString({ message: 'request body was not provided' })
            };
        }
    }
}
