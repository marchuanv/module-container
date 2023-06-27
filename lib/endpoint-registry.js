const path = require("path");
const utils = require("utils");
const { createSession } = require('./store');

const rootFileNameExp = /^v[0-9]+.js$/g;
const handlers = [];
let lock = false;

createSession({ sessionId: 'f3ab396e-b549-4fbe-9eda-21570147f78a' }).then(async ({ session }) => {
    lock = true;
    await utils.walkDir(path.join(__dirname, 'endpoints'), async (handlerFilePath) => {
        try {
            const handler = require(handlerFilePath);
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
    lock = false;
});

module.exports = {
    findHandler: (regEx) => {
        return new Promise((resolve) => {
            setTimeout(async () => {
                if (lock) {
                    await resolve(await findHandler(regEx));
                } else {
                    lock = true;
                    regEx.lastIndex = -1;
                    const matchingHandlers = handlers.filter(h => regEx.test(h.name) && !h.isRoot);
                    if (matchingHandlers.length === 0) {
                        lock = false;
                        await resolve(null);
                    } else {
                        lock = false;
                        await resolve(matchingHandlers[0]);
                    }
                }
            }, 1000);
        });
    },
    findRootHandler: (regEx) => {
        return new Promise((resolve) => {
            setTimeout(async () => {
                if (lock) {
                    await resolve(await findRootHandler(regEx));
                } else {
                    lock = true;
                    regEx.lastIndex = -1;
                    const matchingHandlers = handlers.filter(h => regEx.test(h.name) && h.isRoot);
                    if (matchingHandlers.length === 0) {
                        lock = false;
                        await resolve(null);
                    } else {
                        lock = false;
                        await resolve(matchingHandlers[0]);
                    }
                }
            }, 1000);
        });
    }
}