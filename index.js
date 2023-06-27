const http = require("http");
const logging = require('./lib/logging');
const utils = require("utils");
const path = require("path");
const { createSession } = require('./lib/store');
const activeObjEndpointExp = /^\/api\/v[0-9]+\/active-object\/[a-zA-Z]+\/[a-zA-Z0-9]+.js$/g;
const isGetExp = /active-object\/get/g;
const isCreateExp = /active-object\/create/g;
const isRemoveExp = /active-object\/remove/g;
const isUpdateExp = /active-object\/update/g;
const isDeleteExp = /active-object\/delete/g;
const endpointsDirPath = path.join(__dirname, 'lib', 'endpoints');

createSession({ sessionId: 'f3ab396e-b549-4fbe-9eda-21570147f78a' }).then(({ session }) => {
    const server = http.createServer();
    logging.setLevel({ level: 'info' });
    server.on("request", (request, response) => {
        let requestContent = '';
        let url = request.url.toLowerCase();
        request.on('data', (chunk) => {
            requestContent += chunk;
        });
        request.on('end', async () => {
            let statusCode = -1;
            let statusMessage = '';
            let handle = async () => { return { statusCode: 500, statusMessage: '500 Internal Server Error', responseContent: { message: 'Internal Server Error' } } };
            try {
                requestContent = utils.getJSONObject(requestContent) || {};
                requestContent.url = url;
                activeObjEndpointExp.lastIndex = -1;
                if (activeObjEndpointExp.test(url)) {
                    isGetExp.lastIndex = -1;
                    isCreateExp.lastIndex = -1;
                    isRemoveExp.lastIndex = -1;
                    isUpdateExp.lastIndex = -1;
                    isDeleteExp.lastIndex = -1;
                    if (isGetExp.test(url)) {
                        ({ handle } = require(path.join(endpointsDirPath, `active-object-get.js`)));
                    } else if (isCreateExp.test(url)) {
                        ({ handle } = require(path.join(endpointsDirPath, `active-object-create.js`)));
                    } else if (isRemoveExp.test(url)) {
                        ({ handle } = require(path.join(endpointsDirPath, `active-object-remove.js`)));
                    } else if (isUpdateExp.test(url)) {
                        ({ handle } = require(path.join(endpointsDirPath, `active-object-update.js`)));
                    } else if (isDeleteExp.test(url)) {
                        ({ handle } = require(path.join(endpointsDirPath, `active-object-delete.js`)));
                    } else {
                        handle = async () => { return { statusCode: 404, statusMessage: '404 Not Found', responseContent: { message: '404 Not Found' } } };
                    }
                } else {
                    handle = async () => { return { statusCode: 404, statusMessage: '404 Not Found', responseContent: { message: '404 Not Found' } } };
                }
                ({ statusCode, statusMessage, responseContent } = await handle(session, requestContent));
            } catch (err) {
                console.log(err);
                handle = async () => { return { statusCode: 500, statusMessage: '500 Internal Server Error', responseContent: { message: 'Internal Server Error' } } };
                ({ statusCode, statusMessage, responseContent } = await handle(session, requestContent));
            }
            response.writeHead(statusCode, statusMessage, {
                'Content-Length': Buffer.byteLength(JSON.stringify(responseContent)),
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify(responseContent));
        });
    });
    server.listen(process.env.PORT || 80);
});
