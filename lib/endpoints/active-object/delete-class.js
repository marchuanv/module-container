const utils = require("utils");
const { rmSync, existsSync } = require('../../../lib/store.js');
module.exports = {
    name: 'active-object-class-delete',
    isRoot: false,
    handle: async ({ }) => {
        const fileName = `${module.exports.name}.js`;
        const exists = await existsSync(fileName);
        if (exists) {
            await rmSync(fileName);
            return {
                contentType: 'application/json',
                statusCode: 200,
                statusMessage: 'Success',
                responseContent: utils.getJSONString({ message: 'success' })
            };
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: utils.getJSONString({ message: '404 Not Found' })
            };
        }
    }
}