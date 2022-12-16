const http = require("http");
const fetch = require("./fetch");
const utils = require("utils");
const vm = require('node:vm');
const server = http.createServer();
const { Octokit } = require("octokit");
const octokit = new Octokit({ auth: process.env.GIT });

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
    
        if (aoName !== 'main') {
            let branchExists = false;
            try {
                await octokit.request(`GET /repos/marchuanv/active-objects/branches/${aoName}`);
                branchExists = true;
            } catch (error) {
                console.error(error);
            }
            if (!branchExists) {
                try {
                    await octokit.request(`POST /repos/marchuanv/active-objects/git/refs`, {
                       ref: `refs/heads/${aoName}`,
                       sha: revision
                    });
                } catch(error) {
                    console.error(error);
                }
            }
            let revision = "";
            try {
                const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
                revision = data.shift().object.sha;
                console.log('latest revision: ', revision);
            } catch (error) {
                console.error(error);
            }
            if (request.method === 'GET') {
                try {
                    const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${aoName}.js?ref=${aoName}`);
                    content = await fetch({ url: data.download_url});
                        results.statusCode = 200;
                        results.statusMessage = 'Success';
                        results.message = 'Active Object Info';
                        results.script = content;
                } catch(error) {
                    console.error(error);
                }
            } else if (aoName && request.method === 'PUT') {    
                let fileSha = undefined;
                try {
                    const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${aoName}.js?ref=${aoName}`);
                    fileSha = data?.sha;
                } catch(error) {
                    console.error(error);
                }
                let message = `${aoName}.js script created`;
                if (fileSha) {
                    message = `${aoName}.js script updated`;
                }
                try {
                    if (content) {
                        let isValidScript = true;
                        try {
                            const context = {};
                            vm.createContext(context); // Contextify the object.
                            vm.runInContext(content, context);
                        } catch (error) {
                            console.error(error);
                            isValidScript = false;  
                            results.error = error.message;
                            results.stack = error.stack;
                        }
                        if (isValidScript) {
                            await octokit.request(`${request.method} /repos/marchuanv/active-objects/contents/${aoName}.js`, {
                                owner: 'marchuanv',
                                repo: 'active-objects',
                                path: `/${aoName}.js`,
                                message,
                                branch: aoName,
                                committer: {
                                name: 'active-objects-admin',
                                email: 'active-objects-admin@gmail.com'
                                },
                                content: utils.stringToBase64(content),
                                sha: fileSha
                            });
                            results.statusCode = 200;
                            results.statusMessage = 'Success';
                            results.message = 'Active Object Created/Updated';
                        } else {
                            results.statusCode = 422;
                            results.statusMessage = 'Unprocessable Entity';
                            results.message = 'Active Object Script Error';
                        }
                    } else {
                         results.statusCode = 400;
                         results.statusMessage = 'Bad Request';
                         results.message = 'No Active Object Script';
                    }
                } catch(error) {
                    console.error(error);
                }
              
            } else if (aoName && request.method === 'DELETE' && branchExists) {
                try {
                    await octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${aoName}`);
                    results.statusCode = 200;
                    results.statusMessage = 'Success';
                    results.message = 'Active Object Deleted';
                } catch (error) {
                    console.error(error);
                }
            } else if (aoName && request.method === 'POST' && functionName) {
                try {
                    const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${aoName}.js?ref=${aoName}`);
                    const script = await fetch({ url: data.download_url});
                    const context = {};
                    vm.createContext(context); // Contextify the object.
                    vm.runInContext(script, context);
                    context[functionName]();
                } catch(error) {
                    console.error(error);
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
