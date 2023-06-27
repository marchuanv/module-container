const utils = require("utils");
module.exports = {
    handle: async ({ writeFileSync, existsSync }, requestContent) => {
        const { url, name, script } = requestContent;
        if (name && script) {
            requestContent.url = undefined;
            const exists = await existsSync(url);
            if (!exists) {
                await writeFileSync(url, utils.getJSONString(requestContent));
            }
            return { statusCode: 200, statusMessage: 'Success', responseContent: { message: '', content: '' } };
        } else {
            return { statusCode: 400, statusMessage: '400 Bad Request', responseContent: { message: 'request body must be json and require name and script fields', content: '' } };
        }
    }
}