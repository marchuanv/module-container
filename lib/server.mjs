import { Container, Route } from './registry.mjs'
import http from 'node:http'
export class ActiveObjectServer extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        server: {
                            value: http.createServer()
                        },
                        configure: {
                            callback: async () => {
                                const server = await this.server;
                                server.on("request", (request, response) => {
                                    const path = request.url.toLowerCase();
                                    const headers = request.headers;
                                    let content = '';
                                    request.on('data', (chunk) => content += chunk);
                                    request.on('end', async () => {
                                        const { username, hashedpassphrase, sessionauthtoken } = headers;
                                        const route = new Route({ 
                                            path,
                                            content,
                                            username,
                                            storeAuthToken: process.env.GIT,
                                            hashedPassphrase: hashedpassphrase,
                                            sessionAuthToken: sessionauthtoken
                                        });
                                        {
                                            const { statusCode, statusMessage, content, contentType } = await route.handle();
                                            response.writeHead(statusCode, statusMessage, {
                                                'Content-Length': Buffer.byteLength(content),
                                                'Content-Type': contentType
                                            });
                                            response.end(content);
                                        }
                                    });
                                });
                            },
                            args: {}
                        }
                    },
                    behaviour: {
                        singleton: false,
                        errorHalt: true
                    },
                    mocks: {}
                }
            }
        });
    }
    async start() {
        const port = process.env.PORT || 80;
        const server = await this.server;
        const logging = await this.logging;
        server.listen(port, async () => await logging.log(`server is listening on port ${port}`));
    }
    async stop() {
        const port = process.env.PORT || 80;
        const server = await this.server;
        const logging = await this.logging;
        await logging.log(`server was stoppped on port ${port}`)
        server.close();
    }
}
