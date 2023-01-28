const http = require("http");
const logging = require('./logging');
const utils = require("utils");
const path = require("path");
const { writeFileSync, mkdirSync, existsSync } = require("fs");

const activeObjectsDir = path.join(__dirname, 'objects');
const server = http.createServer();
const privateKey = process.env.GIT;

logging.setLevel({ level: 'info' });

server.on("request", (request, response) => {
    let content = '';
    let url = request.url.toLowerCase();
    request.on('data', (chunk) => {
        content += chunk;
    });
    request.on('end', async () => {
        content = content.toLowerCase();
        console.log("request received");
        const results = {
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'No Active Objects Found'
        };
        const urlSplit = url.split('/').filter(x => x);
        console.log('url segments: ', utils.getJSONString(urlSplit));
        const aoName = urlSplit[0];
        const functionName = urlSplit[1];
        if (aoName && aoName !== 'main') {
            const githubBranch = require('./github-branch')({ privateKey, branchName: aoName });
            const githubFile = require('./github-file')({ privateKey, branchName: aoName, fileName: aoName });
            let branchExists = await githubBranch.isExisting();
            if (!branchExists) {
                await githubBranch.create();
            }
            if (request.method === 'GET') {
                const isExisting = await githubFile.isExisting();
                if (isExisting) {
                    content = await githubFile.getFileContent();
                    results.statusCode = 200;
                    results.statusMessage = 'Success';
                    results.message = 'Active Object Info';
                    results.script = content;
                }
            } else if (aoName && request.method === 'PUT') {
                if (content) {
                    if (!existsSync(activeObjectsDir)) {
                        mkdirSync(activeObjectsDir);
                    }
                    const scriptFilePath = path.join(activeObjectsDir, `${aoName}-script.js`);
                    writeFileSync(path.join(activeObjectsDir, `${aoName}-script.js`), content);
                    const activeObject = require("./active-object")({ url, scriptFilePath });
                    if (activeObject.activate()) {
                        await githubFile.ensureFileContent({ content });
                        results.statusCode = 200;
                        results.statusMessage = 'Success';
                        results.message = 'Active Object Created/Updated';
                    } else {
                        results.statusCode = 500;
                        results.statusMessage = 'Internal Server Error';
                        results.message = 'Active Object Script Error';
                    }
                } else {
                     results.statusCode = 400;
                     results.statusMessage = 'Bad Request';
                     results.message = 'No Active Object Script';
                }
            } else if (aoName && request.method === 'DELETE' && branchExists) {
                await githubFile.deleteFile();
                results.statusCode = 200;
                results.statusMessage = 'Success';
                results.message = 'Active Object Deleted';
            } else if (aoName && request.method === 'POST' && functionName) {
                const script = await githubFile.getFileContent();
                if (!existsSync(activeObjectsDir)) {
                    mkdirSync(activeObjectsDir);
                }
                const scriptFilePath = path.join(activeObjectsDir, `${aoName}-script.js`);
                writeFileSync(path.join(activeObjectsDir, `${aoName}-script.js`), script);
                const activeObject = require("./active-object")({ url, scriptFilePath });
                try {
                    console.log(`executing the ${functionName} function.`);
                    await activeObject.activate();
                    const results = await activeObject.call({ input: content });
                    if (results.message && results.stack) {
                        throw new Error(message);
                    }
                    results.statusCode = 200;
                    results.statusMessage = 'Success';
                    results.message = 'Active Object Function Executed';
                    results.results = results;
                } catch(error) {
                    console.error(error);
                    results.statusCode = 500;
                    results.statusMessage = 'Internal Server Error';
                    results.message = 'Active Object Script Error';
                }
            }
        }
        const { statusCode, statusMessage } = results;
        delete results.statusCode;
        delete results.statusMessage;
        const bodyStr = utils.getJSONString(results);
        response.writeHead(statusCode, statusMessage, {
            'Content-Length': Buffer.byteLength(bodyStr),
            'Content-Type': 'application/json'
        });
        response.end(bodyStr);
    });
});
server.listen(process.env.PORT || 8080);
