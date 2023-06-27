const utils = require("utils");
const aoNameExp = /^\/api\/v[0-9]+\/active-object\/[a-zA-Z]+\/([a-zA-Z0-9]+.js)$/;
module.exports = {
    handle: async ({ writeFileSync, existsSync }, requestContent) => {
        aoNameExp.lastIndex = -1;
        const { url } = requestContent;
        requestContent.url = undefined;
        const exists = await existsSync(url);
        if (aoNameExp.test(url)) {
            if (!exists) {
                await writeFileSync(url, utils.getJSONString(requestContent));
            }
            return { statusCode: 200, statusMessage: 'Success', responseContent: { message: '', content: '' } };
        } else {
            return { statusCode: 400, statusMessage: '400 Bad Request', responseContent: { message: '400 Bad Request' } };
        }
    }
}