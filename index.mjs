import { Container } from './lib/registry.mjs'
class Server {
    start() {
        process.env.ApiVersion = 1;
        const { $routing, $logging, $http, $store } = new Container();
        $logging.setToInfo();
        const server = $http.createServer();
        server.on("request", (req, res) => {
            const path = req.url.toLowerCase();
            const headers = req.headers;
            let content = '';
            req.on('data', (chunk) => {
                content += chunk;
            });
            req.on('end', async () => {
                await $store.login();
                let { statusCode, statusMessage, responseContent, contentType } = {};
                try {
                    ({ statusCode, statusMessage, responseContent, contentType } = await $routing.handle({ path, content, headers }));
                } catch (error) {
                    $logging.log({ error });
                }
                await $store.logout();
                res.writeHead(statusCode, statusMessage, {
                    'Content-Length': Buffer.byteLength(responseContent),
                    'Content-Type': contentType
                });
                res.end(responseContent);
            });
        });
        server.listen(process.env.PORT || 80);
    }
}
const server = new Server();
server.start();