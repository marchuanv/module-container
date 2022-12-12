const http = require("http");
const utils = require("utils");
const server = http.createServer();
server.on("request", (request, response) => {
  console.log("request received");
  const bodyStr = utils.getJSONString({
     message: "hello world";
  });
  response.writeHead(200, { 
    'Content-Length': Buffer.byteLength(bodyStr), 
    'Content-Type': 'application/json' 
  });
  response.end(jsonStr);
});
server.listen(process.env.PORT || 8080);
