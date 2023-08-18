import { Container, Route } from './registry.mjs'
import http from 'node:http';
export class ActiveObjectServer extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        state: {
                            value: {
                                isStarting: false,
                                isRequest: false,
                            }
                        },
                        server: {
                            value: http.createServer()
                        },
                        requests: {
                            value: []
                        },
                        handle: {
                            callback: async () => {
                                const server = await this.server;
                                const requests = await this.requests;
                                const state = await this.state;
                                server.on("request", (request, response) => {
                                    const path = request.url.toLowerCase();
                                    const headers = request.headers;
                                    let content = '';
                                    request.on('data', (chunk) => content += chunk);
                                    request.on('end', async () => {
                                        if (state.isStarting) {
                                            const statusMessage = 'service is not available';
                                            content = `{ "message": "${statusMessage}" }`;
                                            const contentType = 'application/json'
                                            response.writeHead(503, statusMessage, {
                                                'Content-Length': Buffer.byteLength(content),
                                                'Content-Type': contentType
                                            });
                                            response.end(content);
                                        } else {
                                            state.isRequest = true;
                                            const { username, hashedpassphrase, sessionauthtoken } = headers;
                                            requests.unshift({ username, path, hashedpassphrase, sessionauthtoken, content, complete: ({ statusCode, statusMessage, content, contentType }) => {
                                                response.writeHead(statusCode, statusMessage, {
                                                    'Content-Length': Buffer.byteLength(content),
                                                    'Content-Type': contentType
                                                });
                                                response.end(content);
                                                state.isRequest = false;
                                            }});
                                        }
                                        if (!state.isStarting) {
                                            let request =  requests.shift();
                                            while (request) {
                                                state.isRequest = true;
                                                let { path, content, username, hashedpassphrase, sessionauthtoken } = request;
                                                const route = new Route({ path, content, username, storeAuthToken: process.env.GIT, hashedPassphrase: hashedpassphrase, sessionAuthToken: sessionauthtoken });
                                                {
                                                    const { statusCode, statusMessage, content, contentType } = await route.handle();
                                                    request.complete({ statusCode, statusMessage, content, contentType });
                                                }
                                                request = requests.shift();
                                            }
                                            state.isRequest = false;
                                        }
                                    });
                                });
                            },
                            args: {}
                        }
                    },
                    behaviour: {
                        singleton: true,
                        errorHalt: true
                    },
                    mocks: {}
                }
            }
        });
      
    }
    start() {
        return new Promise( async (resolve, reject) => {
            const port = process.env.PORT || 80;
            const server = await this.server;
            const logging = await this.logging;
            const requests = await this.requests;
            const state = await this.state;
            try {
                const id = setInterval(async () => {
                    if (requests.length === 0 && state.isRequest === false) {
                        state.isStarting = true;
                        clearInterval(id);
                        await server.close();
                        await logging.log(`server was stoppped on port ${port}`);
                        await server.listen(port, async () => {
                            state.isStarting = false;
                            await logging.log(`server is listening on port ${port}`);
                        });
                        resolve();
                    }
                }, 100);
            } catch(error) {
                state.isStarting = false;
                reject(error);
            }
        });
    }
}
