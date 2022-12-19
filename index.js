const http = require("http");
const utils = require("utils");
const vm = require('node:vm');
const server = http.createServer();
const privateKey = process.env.GIT;

server.on("request", (request, response) => {
    let content = '';
    request.on('data', (chunk) => {
        content += chunk;
    });
    request.on('end', async () => {
        console.log("request received");
        const results = {
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'No Active Objects Found'
        };
        const urlSplit = request.url.split('/').filter(x => x);
        console.log('url segments: ', utils.getJSONString(urlSplit));
        const aoName = urlSplit[0];
        const functionName = urlSplit[1];
        const githubBranch = require('./github-branch')({ privateKey, branchName: aoName });
        const githubFile = require('./github-file')({ privateKey, branchName: aoName, fileName: aoName });
        if (aoName !== 'main') {
            let branchExists = await githubBranch.isExisting();
            if (!branchExists) {
                await githubBranch.create();
            }
            if (request.method === 'GET') {
                content = await githubFile.getFileContent();
                results.statusCode = 200;
                results.statusMessage = 'Success';
                results.message = 'Active Object Info';
                results.script = content;
            } else if (aoName && request.method === 'PUT') {    
                if (content) {
                    let isValidScript = true;
                    try {
                        const context = {};
                        vm.createContext(context); // Contextify the object.
                        vm.runInContext(content, context);
                    } catch (error) {
                        console.error(error);
                        isValidScript = false; 
                        results.statusCode = 500;
                        results.statusMessage = 'Internal Server Error';
                        results.message = 'Active Object Script Error';
                        results.error = error.message;
                        results.stack = error.stack;
                    }
                    if (isValidScript) {
                        await githubFile.ensureFileContent({ content });
                        results.statusCode = 200;
                        results.statusMessage = 'Success';
                        results.message = 'Active Object Created/Updated';
                    }
                } else {
                     results.statusCode = 400;
                     results.statusMessage = 'Bad Request';
                     results.message = 'No Active Object Script';
                }
            } else if (aoName && request.method === 'DELETE' && branchExists) {
                await githubBranch.delete();
            } else if (aoName && request.method === 'POST' && functionName) {
                let script = await githubBranch.getFileContent();
                if (script) {       
                    try {
                       console.log(`executing the ${functionName} function.`);
                       const context = { };
                       vm.createContext(context);
                       vm.runInContext(script, context);
                       context[functionName]();
                       results.statusCode = 200;
                       results.statusMessage = 'Success';
                       results.message = 'Active Object Function Executed';
                    } catch(error) {
                       console.error(error);
                       results.statusCode = 500;
                       results.statusMessage = 'Internal Server Error';
                       results.message = 'Active Object Script Error';
                       results.error = error.message;
                       results.stack = error.stack;
                    }  
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
