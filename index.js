const http = require("http");
const https = require("https");
const utils = require("utils");
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
    
        if (aoName !== 'main') {
            let branchExists = false;
            try {
                await octokit.request(`GET /repos/marchuanv/active-objects/branches/${aoName}`);
                branchExists = true;
            } catch (error) {
                console.error(error);
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
                    https.get(data.download_url, (resp) => {
                        content = "";
                        resp.on('data', (chunk) => content += chunk);
                    }).on("error", (err) => {
                        console.log("Error: " + err.message);
                    });
                    results.statusCode = 200;
                    results.statusMessage = 'Success';
                    results.message = 'Active Object Info';
                    results.name = aoName;
                    results.data = content;
                } catch(error) {
                    console.error(error);
                }
            } else if (aoName && request.method === 'PUT') {
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
                } catch(error) {
                    console.error(error);
                }
                results.statusCode = 200;
                results.statusMessage = 'Success';
                results.message = 'Active Object Created/Updated';
                results.name = aoName;
            } else if (aoName && request.method === 'DELETE' && branchExists) {
                try {
                    await octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${aoName}`);
                    results.statusCode = 200;
                    results.statusMessage = 'Success';
                    results.message = 'Active Object Deleted';
                    results.name = aoName;
                } catch (error) {
                    console.error(error);
                }
            }
        }
       
        const bodyStr = utils.getJSONString(results);
        response.writeHead(results.statusCode, results.statusMessage, {
            'Content-Length': Buffer.byteLength(bodyStr),
            'Content-Type': 'application/json'
        });
        response.end(bodyStr);
    });
});
server.listen(process.env.PORT || 8080);
