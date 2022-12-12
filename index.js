const http = require("http");
const server = http.createServer();
server.on("request", (request, response) => {
  console.log("request received");
  response.write("hello world");
});
server.listen(process.env.PORT || 8080);
