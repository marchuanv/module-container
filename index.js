const http = require("http");
const utils = require("utils");

const server = http.createServer();
const privateKey = process.env.GIT;

const logging = require('./logging');
logging.setLevel({ level: 'info' });

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
                const activeObject = require("./active-object")({ url: request.url, script: content });   
                if (content) {
                    if (await activeObject.isValidScript()){
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
                const activeObject = require("./active-object")({ url: request.url, script });
                if (script) {       
                    try {
                       console.log(`executing the ${functionName} function.`);
                       await activeObject.activate();
                       results.statusCode = 200;
                       results.statusMessage = 'Success';
                       results.message = 'Active Object Function Executed';
                       results.results = await activeObject.call({ input: content });
                    } catch(error) {
                       console.error(error);
                       results.statusCode = 500;
                       results.statusMessage = 'Internal Server Error';
                       results.message = 'Active Object Script Error';
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
