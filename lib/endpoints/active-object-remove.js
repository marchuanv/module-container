const utils = require("utils");
module.exports = {
    handle: async ({ rmSync, existsSync }, { url }) => {
        const exists = await existsSync(url);
        if (exists) {
            await rmSync(url);
            return { statusCode: 200, statusMessage: 'Success', responseContent: {} };
        } else {
            return { statusCode: 404, statusMessage: '404 Not Found', responseContent: { message: '404 Not Found' } };
        }
    }
}