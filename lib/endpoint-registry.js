(async () => {

    const path = await require("path");
    const utils = await require("utils");
    const rootFileNameExp = /^v[0-9]+.js$/g;
    const handlers = [];

    await utils.walkDir(path.join(__dirname, 'endpoints'), async (handlerFilePath) => {
        try {
            const handler = await require(handlerFilePath);
            rootFileNameExp.lastIndex = -1;
            if (rootFileNameExp.test(handler.name)) { //root handlers
                handlers.push(handler);
            } else {
                handlers.push(handler);
            }
        } catch (err) {
            console.log(`error requiring and creating handler: ${handlerFilePath}.`, err);
        }
    });
    module.exports = {
        findHandler: (regEx) => {
            regEx.lastIndex = -1;
            const matchingHandlers = handlers.filter(h => regEx.test(h.name) && !h.isRoot);
            return matchingHandlers[0];
        },
        findRootHandler: (regEx) => {
            regEx.lastIndex = -1;
            const matchingHandlers = handlers.filter(h => regEx.test(h.name) && h.isRoot);
            return matchingHandlers[0];
        }
    }
})();