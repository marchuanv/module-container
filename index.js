const http = require("http");
const { existsSync, writeFileSync, mkdirSync, rmSync } = require('fs');
const path = require('path');
const utils = require("utils");
const server = http.createServer();
const { Octokit, App } = require("octokit");
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
  } catch(error) {
      if (error.status===404) {
          branchExists = false;
      } else {
          throw(error);
      }
  }
  
  if (request.method === 'GET') {
     if (existsSync(aoJsonFilePath) && request.url.startsWith(`/${aoName}`)) {
        results.statusCode = 200;
        results.statusMessage = 'Success';
        results.message = 'Known Active Object';
        results.name = aoName;
    } else if (existsSync(activeAOJsonFilePath)) {
        results.statusCode = 200;
        results.statusMessage = 'Success';
        results.message = 'Current Active Object';
        results.name = aoName;
    }
  } else if (aoName && request.method === 'PUT' && !branchExists ) {
        console.log(`${aoName} does not exist.`);
        let revision = "";
        try {
            const {data} = await octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
            revision = data.shift().object.sha;
        } catch(error) {
            throw(error);
        }
        if (revision) {
            console.log('latest revision: ', revision);
        }
        try {
            await octokit.request(`POST /repos/marchuanv/active-objects/git/refs`,{
               ref: `refs/heads/${aoName}`,
               sha: revision
            });
        } catch(error) {
           throw(error);
        }
  } else if (aoName && request.method === 'DELETE' && branchExists ) {
        // repos/${{ github.repository }}/git/refs/heads/${{ github.head_ref }
        try {
            await octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${}`,{
               ref: `refs/heads/${aoName}`,
               sha: revision
            });
        } catch(error) {
           throw(error);
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

