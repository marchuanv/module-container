const http = require("http");
const logging = require('./lib/logging');
const utils = require("utils");
const path = require("path");

require('./lib/store').createSession({ sessionId: 'f3ab396e-b549-4fbe-9eda-21570147f78a' }).then((session) => {
    
    const { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } = session;

    const activeObjectsDir = path.join(__dirname, 'objects');
    const server = http.createServer();
    
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
            const activeObjectDirPath = path.join(activeObjectsDir, aoName);
            const activeObjectScriptFilePath = path.join(activeObjectDirPath, `${aoName}-script.js`);
            if (aoName) {
                if (request.method === 'GET' && (await existsSync(activeObjectScriptFilePath)) ) {
                    content = await readFileSync(activeObjectScriptFilePath);
                    results.statusCode = 200;
                    results.statusMessage = 'Success';
                    results.message = 'Active Object Info';
                    results.script = content;
                } else if (request.method === 'PUT') {
                    if (content) {
                        if (!(await existsSync(activeObjectDirPath)) ) {
                            await mkdirSync(activeObjectDirPath);
                        }
                        await writeFileSync(activeObjectScriptFilePath, content);
                        const activeObject = (await require("./lib/active-object")({ url, scriptFilePath: activeObjectScriptFilePath }));
                        if (activeObject.activate()) {  
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
                } else if (request.method === 'DELETE' && (await existsSync(activeObjectScriptFilePath)) ) {
                    await rmSync(activeObjectScriptFilePath);
                    results.statusCode = 200;
                    results.statusMessage = 'Success';
                    results.message = 'Active Object Deleted';
                } else if (request.method === 'POST' && functionName && (await existsSync(activeObjectScriptFilePath)) ) {
                    const activeObject = (await require("./lib/active-object")({ url, scriptFilePath: activeObjectScriptFilePath }));
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
});
