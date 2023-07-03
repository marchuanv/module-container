import { Container } from './lib/registry.mjs'
class Server {
    start() {
        const { $endpointRegistry, $logging, $http } = new Container();
        const rootHandler = $endpointRegistry.findHandler(/v1/g);
        $logging.setLevel({ level: 'info' });
        $logging.log({ info: `using ${rootHandler.name} root handler.` });
        const server = $http.createServer();
        server.on("request", (req, res) => {
            const path = req.url.toLowerCase();
            const headers = req.headers;
            let content = '';
            req.on('data', (chunk) => {
                content += chunk;
            });
            req.on('end', async () => {
                let { statusCode, statusMessage, responseContent, contentType } = {};
                try {
                    ({ statusCode, statusMessage, responseContent, contentType } = await rootHandler.handle({ path, content, headers }));
                } catch (error) {
                    $logging.log({ info: 'root handler should handle all errors, this should not happen.' });
                    $logging.log({ error });
                }
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