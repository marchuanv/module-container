const http = require("http");
const https = require("https");
const utils = require("utils");
const server = http.createServer();
const { Octokit } = require("octokit");
const octokit = new Octokit({ auth: process.env.GIT });

server.on("request", async (request, response) => {
    console.log("request received");
    const results = {
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'No Active Objects Found'
    };
    const urlSplit = request.url.split('/').filter(x => x);
    console.log('url segments: ', utils.getJSONString(urlSplit));
    const aoName = urlSplit[0];

    console.log(`context: ${aoName}`);

    let branchExists = false;
    try {
        await octokit.request(`GET /repos/marchuanv/active-objects/branches/${aoName}`);
        branchExists = true;
    } catch (error) {
        if (error.status === 404) {
            branchExists = false;
        } else {
            throw (error);
        }
    }

    let revision = "";
    try {
        const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
        revision = data.shift().object.sha;
        console.log('latest revision: ', revision);
    } catch (error) {
        throw (error);
    }
    if (request.method === 'GET') {
        const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${aoName}.js`);
        https.get(data.download_url, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                console.log(JSON.parse(data).explanation);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } else if (aoName && request.method === 'PUT' && !branchExists) {
        console.log(`${aoName} does not exist.`);
        try {
            await octokit.request(`POST /repos/marchuanv/active-objects/git/refs`, {
                ref: `refs/heads/${aoName}`,
                sha: revision
            });
            results.statusCode = 200;
            results.statusMessage = 'Success';
            results.message = 'Active Object Created';
            results.name = aoName;
        } catch (error) {
            throw (error);
        }
    } else if (aoName && request.method === 'DELETE' && branchExists) {
        try {
            await octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${aoName}`);
            results.statusCode = 200;
            results.statusMessage = 'Success';
            results.message = 'Active Object Deleted';
            results.name = aoName;
        } catch (error) {
            throw (error);
        }
    }

    const bodyStr = utils.getJSONString(results);
    response.writeHead(results.statusCode, results.statusMessage, {
        'Content-Length': Buffer.byteLength(bodyStr),
        'Content-Type': 'application/json'
    });
    response.end(bodyStr);
});
server.listen(process.env.PORT || 8080);
