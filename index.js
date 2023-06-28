const { error } = require("console");
const http = require("http");
require('./lib/extensions');
(async () => {
    const logging = await require('/lib/logging.js');
    const registry = await require('/lib/endpoint-registry.js');
    logging.setLevel({ level: 'info' });
    const { findRootHandler } = registry;
    const rootHandler = await findRootHandler(/v1/g);
    if (!rootHandler) {
        throw new Error('there are no root handlers.');
    }
    console.log(`using ${rootHandler.name} root handler.`);
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
    module.exports = {
        stop: () => {
        },
        start: () => {
        }
    };
})();


