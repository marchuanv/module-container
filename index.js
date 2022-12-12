const http = require("http");
const { existsSync } = require('fs');
const path = require('path');
const utils = require("utils");
const server = http.createServer();
server.on("request", (request, response) => {
  console.log("request received");
  const results = {
     statusCode: 404,
     statusMessage: 'Not Found',
     message: 'Not Found'
  };
  const urlSplit = request.url.split(/\//g);
  const oaName = urlSplit[0];

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

  if (existsSync(aoJsonFilePath)) {
    if (request.url.startsWith(`/${aoName}`)) {
     results.statusCode = 200;
     results.statusMessage = 'Success';
     results.message = 'Known Active Object Summary';
     results.name = aoName;
    }
  }
  if (existsSync(activeAOJsonFilePath)) {
     results.statusCode = 200;
     results.statusMessage = 'Success';
     results.message = 'Current Active Object Summary';
     results.name = aoName;
  }
  const bodyStr = utils.getJSONString(results);
  response.writeHead(results.statusCode, results.statusMessage, { 
    'Content-Length': Buffer.byteLength(bodyStr), 
    'Content-Type': 'application/json' 
  });
  response.end(bodyStr);
});
server.listen(process.env.PORT || 8080);
