const utils = require("utils");
const logging = require('../logging');
const registry = require('../../lib/endpoint-registry.js');
const store = require('../../lib/store.js');

const { findHandler } = registry;
const activeObjEndpointExp = /^\/api\/v[0-9]+\/active-object\/[a-zA-Z]+\/[a-zA-Z]+\/[a-zA-Z0-9]+$/g;
const expressions = [
    { path: /active-object\/config\/get/g, name: /active-object-config-get/g },
    { path: /active-object\/config\/create/g, name: /active-object-config-create/g },
    { path: /active-object\/config\/remove/g, name: /active-object-config-remove/g },
    { path: /active-object\/class\/get/g, name: /active-object-class-get/g },
    { path: /active-object\/class\/create/g, name: /active-object-class-create/g },
    { path: /active-object\/class\/remove/g, name: /active-object-class-remove/g }
];
module.exports = {
    name: 'v1',
    isRoot: true,
    handle: async ({ path, content, headers }) => {
        let handler = null;
        for (const exp of expressions) {
            if (exp.path.test(path)) {
                handler = await findHandler(exp.name);
            }
        }
        if (handler) {
            try {
                handler.handle({ path, content, headers })
            } catch (error) {
                logging.log({ error });
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: utils.getJSONString({ message: 'no request handlers was found.' })
            };
        }


        // const internalServerErrorTemplate = {
        //     contentType: 'application/json',
        //     statusCode: 500,
        //     statusMessage: '500 Internal Server Error',
        //     responseContent: utils.getJSONString({ message: 'Internal Server Error' })
        // };
        // const endpointNotFoundErrorTemplate = {
        //     contentType: 'application/json',
        //     statusCode: 404,
        //     statusMessage: '404 Not Found',
        //     responseContent: utils.getJSONString({ message: '404 Not Found' })
        // };

    }
}