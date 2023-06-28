(async () => {
    const utils = await require("utils");
    const { readFileSync, existsSync } = await require('/lib/store.js');
    module.exports = {
        name: 'active-object-class-get',
        isRoot: false,
        handle: async ({ }) => {
            const fileName = `${module.exports.name}.js`;
            const exists = await existsSync(fileName);
            if (exists) {
                let content = await readFileSync(fileName);
                content = utils.getJSONObject(content);
                return {
                    contentType: 'text/javascript',
                    statusCode: 200,
                    statusMessage: 'Success',
                    responseContent: utils.getJSONString(content)
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