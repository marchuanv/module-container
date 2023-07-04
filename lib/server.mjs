import { Container, Route, Logging, Store } from './registry.mjs'
export class Server extends Container {
    constructor() {
        super();
        this.register({ Class: Logging });
        this.register({ Class: Store });
        this.logging.setToInfo();
        const server = this.http.createServer();
        server.on("request", (request, response) => {
            const path = request.url.toLowerCase();
            const headers = request.headers;
            let content = '';
            request.on('data', (chunk) => content += chunk);
            request.on('end', async () => {
                const { statusCode, statusMessage, responseContent, contentType } = await this.handlRequest({ path, content, headers });
                response.writeHead(statusCode, statusMessage, {
                    'Content-Length': Buffer.byteLength(responseContent),
                    'Content-Type': contentType
                });
                response.end(responseContent);
            });
        });
        server.listen(process.env.PORT || 80);
    }
    async handlRequest({ path, content, headers }) {
        await this.store.login();
        this.register({ Class: Route, args: { path, content, headers } });
        const { statusCode, statusMessage, responseContent, contentType } = await this.route.handle();
        this.route.destroy();
        await this.store.logout();
        return { statusCode, statusMessage, responseContent, contentType };
    }
}
