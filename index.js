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

  let branchExist=false;
  try {
      info = await octokit.request(`GET /repos/marchuanv/active-objects/branches/${aoName}`);
  } catch(error) {
      console.log('STATUS CODE:', error.status);
      if (false) {
          branchExist = false;
      }
  }

  console.log('BRANCH INFO: ', info);

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

