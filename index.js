const http = require("http");
const utils = require("utils");
const server = http.createServer();
server.on("request", (request, response) => {
  console.log("request received");
  const results = {
     statusCode: 404,
     statusMessage: 'Not Found',
     message: 'Not Found'
  }:
  if (request.path === '/active') {
     results.statusCode = 200;
     results.statusMessage = 'Success';
     results.message 'no active objects';
  }
  const bodyStr = utils.getJSONString(results);
  response.writeHead(results.statusCode, results.statusMessage, { 
    'Content-Length': Buffer.byteLength(bodyStr), 
    'Content-Type': 'application/json' 
  });
  response.end(bodyStr);
});
server.listen(process.env.PORT || 8080);
