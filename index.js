const http = require("http");
const server = http.createServer();
server.on("request", (request) => {
  console.log("request received");
});
server.listen(process.env.PORT || 8080);
