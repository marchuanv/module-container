const utils = require("utils");
module.exports = {
    handle: async ({ readFileSync, existsSync }, { url }) => {
        const exists = await existsSync(`${url}.js`);
        if (exists) {
            let content = await readFileSync(`${url}.js`);
            content = utils.getJSONObject(content);
            return { statusCode: 200, statusMessage: 'Success', responseContent: content };
        } else {
            return { statusCode: 404, statusMessage: '404 Not Found', responseContent: { message: '404 Not Found' } };
        }
    }
}