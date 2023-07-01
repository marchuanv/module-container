import { Container } from '../registry.mjs';
const endpointExpression = /^\/api\/v[0-9]+\/active-object\/[a-zA-Z]+\/[a-zA-Z]+\/[a-zA-Z0-9]+$/g;
const expressions = [
    { path: /active-object\/config\/get/g, name: /active-object-config-get/g },
    { path: /active-object\/config\/create/g, name: /active-object-config-create/g },
    { path: /active-object\/config\/remove/g, name: /active-object-config-remove/g },
    { path: /active-object\/class\/get/g, name: /active-object-class-get/g },
    { path: /active-object\/class\/create/g, name: /active-object-class-create/g },
    { path: /active-object\/class\/remove/g, name: /active-object-class-remove/g }
];
export class v1 extends Container {
    name = 'v1';
    isRoot = true;
    async handle({ path, content, headers }) {
        let handler = null;
        for (const exp of expressions) {
            if (exp.path.test(path)) {
                handler = $registry.findHandler(exp.name);
            }
        }
        if (handler) {
            try {
                return await handler.handle({ path, content, headers });
            } catch (error) {
                $logging.log({ info: error.message });
                return {
                    contentType: 'application/json',
                    statusCode: 500,
                    statusMessage: '500 Internal Server Error',
                    responseContent: $utils.getJSONString({ message: 'internal server error.' })
                };
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: $utils.getJSONString({ message: 'no request handlers was found.' })
            };
        }
    }
}
