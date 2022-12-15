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

  if (!branchExists) {
      console.log(`${aoName} does not exist.`);
      let revision = "";
      try {
          const {data} = await octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
          revision = data.find(x=>x.sha).map(x=>x.sha);
      } catch(error) {
          throw(error);
      }
      if (revision) {
          console.log('latest revision: ', JSON.stringify(revision));
      }
      try {
           await octokit.request(`POST /repos/marchuanv/active-objects/git/refs`,{
            ref: `refs/heads/${aoName}`,
            sha: revision
          });
       } catch(error) {
          throw(error);
       }
   }

  // https://api.github.com/repos/<AUTHOR>/<REPO>/git/refs
  // https://api.github.com/repos/<AUTHOR>/<REPO>/git/refs/heads
  
  const aoJsonFileDir = path.join(
      __dirname,
      aoName
  );
  const aoJsonFilePath = path.join(
      aoJsonFileDir,
      `${aoName}.json`
  );
  const activeAOJsonFilePath = path.join(
      __dirname,
      'active-object.json'
  );

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
  } else if (aoName && request.method === 'PUT' && !existsSync(aoJsonFileDir) ) {
    console.log('creating');
    mkdirSync(aoJsonFileDir);
    writeFileSync(
      aoJsonFilePath, 
      utils.getJSONString({aoName})
    );
  } else if (aoName && request.method === 'DELETE' && existsSync(aoJsonFileDir) ) {
    rmSync(aoJsonFileDir, { recursive: true });
  }
  
  const bodyStr = utils.getJSONString(results);
  response.writeHead(results.statusCode, results.statusMessage, { 
    'Content-Length': Buffer.byteLength(bodyStr), 
    'Content-Type': 'application/json' 
  });
  response.end(bodyStr);
});
server.listen(process.env.PORT || 8080);

