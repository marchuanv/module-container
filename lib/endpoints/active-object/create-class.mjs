const members = new WeakMap();
export class CreateClass {
    name = 'active-object-class-create';
    isRoot = false;
    constructor({ utils, vm, store }) {
        members.set(this, { store, vm, utils });
    }
    async handle({ content }) {
        const { store, utils, vm } = members.get(this);
        const fileName = `${this.name}.js`;
        if (content && typeof content === 'string') {
            if ((await store.exists(fileName))) {
                return {
                    contentType: 'application/json',
                    statusCode: 409,
                    statusMessage: '409 Conflict',
                    responseContent: utils.getJSONString({ message: `${fileName} already exist.` })
                };
            } else {
                try {
                    const context = {};
                    const vmScript = new vm.Script(content);
                    vmScript.runInContext(context);
                    await writeFileSync(fileName, utils.getJSONString(content));
                } catch {
                    return {
                        contentType: 'application/json',
                        statusCode: 400,
                        statusMessage: '400 Bad Request',
                        responseContent: utils.getJSONString({ message: 'request body is not valid java script' })
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
