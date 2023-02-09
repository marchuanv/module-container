const fs = require('fs');
const path = require('path');
const privateKey = process.env.GIT;
const store = { name: '%root%', isDirectory: false, isFile: false, extension: null, children: [] };
const storeOperations = {};

const walkSync = (dir, callback) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      var filepath = path.join(dir, file);
      const stats = fs.statSync(filepath);
      if (stats.isDirectory()) {
        walkSync(filepath, callback);
      } else if (stats.isFile()) {
        callback(filepath, stats);
      }
    });
};

const findSpecInfo = (specName, specInfo) => {
    let results = [];
    if (specInfo) {
        if (specName) {
            if (specInfo.name === specName) {
                results.push(specInfo);
            } else if (path.resolve(specInfo.path).startsWith(path.resolve(specName))) {
                results.push(specInfo);
            }
        } else {
            results.push(specInfo.path);
        }
    } else {
        specInfo = store;
    }
    for(const _specInfo of specInfo.children) {
       const _foundFileInfo = findSpecInfo(specName, _specInfo);
       results = results.concat(_foundFileInfo);
    }
    return results;
}

const populateStore = (filePath) => {
    const fileExtName = path.extname(filePath);
    const fileName = path.basename(filePath).replace(fileExtName,'');
    let segments = path.dirname(filePath).split('\\');
    if (segments.length <= 1) {
        segments = path.dirname(filePath).split('/');
    }
    let depth = 1;
    let parent = store;
    let _filePath = "";
    let dirName = "";
    do {
        depth = depth + 1;
        dirName = segments.shift();
        if (dirName) {
            const allInfo = findSpecInfo(dirName);
            let specInfo = allInfo.find(x => x.depth === depth);
            if (specInfo) {
                _filePath = specInfo.path;
            } else {
                if (_filePath) {
                    _filePath = path.join(_filePath, dirName);
                } else {
                    _filePath = dirName;
                }
                specInfo = { name: dirName, isDirectory: true, isFile: false, extension: null, children: [], depth, path: _filePath };
                parent.children.push(specInfo);
            }
            parent = specInfo;
        }
    } while(dirName);
    _filePath = path.join(_filePath, `${fileName}${fileExtName}`);
    parent.children.push({ name: fileName, isDirectory: false, isFile: true, extension: fileExtName, content: fs.readFileSync(filePath,'utf8'), depth, children: [], path: _filePath });
};

walkSync(path.join(__dirname), (filePath) => {
    populateStore(filePath);
});
walkSync(path.join(__dirname, '../', 'tests'), (filePath) => {
    populateStore(filePath);
});

const existsSync = async (filePath) => {
    const found = findSpecInfo(filePath);
    const fileName = path.basename(filePath);
    const githubFile = require('./github-file')({ privateKey, branchName: module.exports.sessionId, fileName });
    const isExisting = await githubFile.isExisting();
    return found.length === 0 && !isExisting;
}
storeOperations["existsSync"] = existsSync;

const mkdirSync = async (dirPath) => {
    const found = findSpecInfo(filePath);
    if ( (await existsSync(dirPath)) ) {
        throw new Error(`${dirPath} already exist.`)
    }
    store[dirPath] = null;
}
storeOperations["mkdirSync"] = mkdirSync;

const writeFileSync = async (filePath, data) => {
    const info = getStoreFileInfo(filePath);
    const fileName = path.basename(filePath);
    const githubFile = require('./github-file')({ privateKey, branchName: module.exports.sessionId, fileName });
    await githubFile.ensureFileContent({ content: data });
    store[filePath] = data;
}
storeOperations["writeFileSync"] = writeFileSync;

const readFileSync = async (filePath) => {
    const info = getStoreFileInfo(filePath);
    if (store[filePath]) {
        return store[filePath];
    }
    const fileName = path.basename(filePath);
    const githubFile = require('./github-file')({ privateKey, branchName: module.exports.sessionId, fileName });
    const script = await githubFile.getFileContent();
    if (script) {
        store[filePath] = script;
        return;
    }
    throw new Error(`${filePath} does not exist.`)
}
storeOperations["readFileSync"] = readFileSync;

const rmSync = async (filePath) => {
    const info = getStoreFileInfo(filePath);
    const fileName = path.basename(filePath);
    const githubFile = require('./github-file')({ privateKey, branchName: module.exports.sessionId, fileName });
    await githubFile.deleteFile();
    store[filePath] = undefined;
};
storeOperations["rmSync"] = rmSync;

module.exports = {
    createSession: async ({ sessionId }) => {
        const githubBranch = require('./github-branch')({ privateKey, branchName: sessionId });
        if ( !(await githubBranch.isExisting()) ) {
            await githubBranch.create();
        }
        module.exports.sessionId = sessionId;
        return storeOperations;    
    }
};