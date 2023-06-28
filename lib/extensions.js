const utils = require('utils');
const Module = require('module');
const requireCache = require.cache;
const requireResolve = require.resolve;
const originalRequire = Module.prototype.require;
const rootDirPath = module.path;
Module.prototype.require = function () {
    const currentModule = this;
    if (currentModule.filename.indexOf('node_modules') === -1 && currentModule.id !== 'C:\\active-objects\\lib\\extensions.js') {
        const isUnixPath = /\//g.test(arguments[0]);
        const isWindowsPath = /\\/g.test(arguments[0]);
        const isWin = process.platform === "win32";
        if (isUnixPath || isWindowsPath) {
            const convertedPath = isWin ? arguments[0].replace(/\//g, '\\') : arguments[0].replace(/\\/g, '/');
            utils.walkDir(rootDirPath, (filePath) => {
                if (filePath.endsWith(convertedPath)) {
                    arguments[0] = filePath;
                }
            });
        }
        let exports = originalRequire.apply(currentModule, arguments);
        if (exports && Object.keys(exports).length > 0) {
            console.log(`resolve ${currentModule.id}`);
            return exports;
        }
        const id = setInterval(() => {
            delete requireCache[arguments[0]];
            exports = originalRequire.apply(currentModule, arguments);
            if (exports && Object.keys(exports).length > 0) {
                clearInterval(id)
            }
        }, 1000);
        return new Promise((resolve) => {
            const exportsEvents = {
                exports: {},
                set: (value) => {
                    exportsEvents.exports = value;
                    console.log(`promise resolve ${currentModule.id}`);
                    resolve(exportsEvents.exports);
                },
                get: () => {
                    return exportsEvents.exports;
                }
            };
            Object.defineProperty(currentModule, 'exports', exportsEvents);
        });
    } else {
        return originalRequire.apply(currentModule, arguments);
    }
};