(async () => {
    const utils = await require("utils");
    const { rmSync, existsSync } = await require('/lib/store.js');
    module.exports = {
        name: 'active-object-config-delete',
        isRoot: false,
        handle: async ({ }) => {
            const fileName = `${module.exports.name}.json`;
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
})();