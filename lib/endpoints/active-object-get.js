const aoNameExp = /^\/api\/v[0-9]+\/active-object\/[a-zA-Z]+\/([a-zA-Z0-9]+)$/;
module.exports = {
    handle: async ({ readFileSync, existsSync }, { url }) => {
        aoNameExp.lastIndex = -1;
        const exists = await existsSync(url);
        if (aoNameExp.test(url) && exists) {
            const content = await readFileSync(url);
            return { statusCode: 200, statusMessage: 'Success', responseContent: { message: '', content } };
        } else if (aoNameExp.test(url) && !exists) {
            return { statusCode: 404, statusMessage: '404 Not Found', responseContent: { message: '404 Not Found' } };
        } else {
            return { statusCode: 400, statusMessage: '400 Bad Request', responseContent: { message: '400 Bad Request' } };
        }
    }
}