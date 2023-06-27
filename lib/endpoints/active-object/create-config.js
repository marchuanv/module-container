const utils = require("utils");
const requestTemplate = { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false };
const { writeFileSync, existsSync } = require('../../../lib/store.js');
module.exports = {
    name: 'active-object-config-create',
    isRoot: false,
    handle: async ({ content }) => {
        const fileName = `${module.exports.name}.json`;
        let isValid = true;
        content = utils.getJSONObject(content);
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
                    responseContent: utils.getJSONString({ message: `${fileName} already exist.` })
                };
            } else {
                await writeFileSync(fileName, utils.getJSONString(request.content));
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 400,
                statusMessage: '400 Bad Request',
                responseContent: utils.getJSONString(requestTemplate)
            };
        }
        return {
            contentType: 'application/json',
            statusCode: 200,
            statusMessage: 'Success',
            responseContent: utils.getJSONString({ message: 'success' })
        };
    }
}