const utils = require("utils");
const requestTemplate = { text: 'function helloWorld() {}' };
module.exports = {
    handle: async ({ writeFileSync, existsSync }, requestContent) => {
        const { url } = requestContent;
        let isValid = true;
        for (const prop of Object.keys(requestTemplate)) {
            if (requestContent[prop] === undefined) {
                isValid = false;
                break;
            }
        }
        if (isValid) {
            requestContent.url = undefined;
            const exists = await existsSync(`${url}.js`);
            if (!exists) {
                await writeFileSync(`${url}.js`, utils.getJSONString(requestContent));
            }
            return { statusCode: 200, statusMessage: 'Success', responseContent: {} };
        } else {
            return { statusCode: 400, statusMessage: '400 Bad Request', responseContent: requestTemplate };
        }
    }
}