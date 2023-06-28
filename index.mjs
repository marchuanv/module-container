import http from 'node:http';
import path from 'node:path';
import vm from 'node:v8';
import utils from 'utils';
import {
    Logging,
    EndpointRegistry,
    Store,
    GithubBranch,
    Github,
    GithubFile
} from './lib/index.mjs';
const github = new Github();
const logging = new Logging();
const githubFile = new GithubFile({ utils, logging, github });
const githubBranch = new GithubBranch({ logging, github });
const store = new Store({ githubBranch, githubFile, utils, logging, path });

store.login().then(() => {
    const registry = new EndpointRegistry({ path, utils, store, logging, vm });
    logging.setLevel({ level: 'info' });
    const rootHandler = registry.findRootHandler(/v1/g);
    logging.log({ info: `using ${rootHandler.name} root handler.` });
    const server = http.createServer();

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
                logging.log({ info: 'root handler should handle all errors, this should not happen.' });
                logging.log({ error });
            }
            res.writeHead(statusCode, statusMessage, {
                'Content-Length': Buffer.byteLength(responseContent),
                'Content-Type': contentType
            });
            res.end(responseContent);
        });
    });
    server.listen(process.env.PORT || 80);
});
