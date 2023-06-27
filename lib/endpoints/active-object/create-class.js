const utils = require("utils");
const vm = require('vm');
const { writeFileSync, existsSync } = require('../../../lib/store.js');
module.exports = {
    name: 'active-object-class-create',
    isRoot: false,
    handle: async ({ content }) => {
        const fileName = `${module.exports.name}.js`;
        if (content && typeof content === 'string') {
            const exists = await existsSync(fileName);
            if (exists) {
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
                responseContent: utils.getJSONString({ message: 'success' })
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: utils.getJSONString({ message: 'request body was not provided' })
            };
        }
    }
}