import { Container, Route } from './registry.mjs'
export class Server extends Container {
    constructor() {
        super();
        const server = this.http.createServer();
        server.on("request", (request, response) => {
            const path = request.url.toLowerCase();
            const headers = request.headers;
            headers['token'] = process.env.GIT;
            let content = '';
            request.on('data', (chunk) => content += chunk);
            request.on('end', async () => {
                const { statusCode, statusMessage, responseContent, contentType } = await this.handlRequest({ path, content, token: headers.token });
                response.writeHead(statusCode, statusMessage, {
                    'Content-Length': Buffer.byteLength(responseContent),
                    'Content-Type': contentType
                });
                response.end(responseContent);
            });
        });
        server.listen(process.env.PORT || 80);
    }
    async handlRequest({ path, content, token }) {
        this.addDependency({ Class: Route, args: { path, content }});
        return await (await this.route).handle();
    }
}
