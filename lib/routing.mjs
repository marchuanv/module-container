import { Container, ContainerRegistry } from './registry.mjs';
import { allEndpoints } from './endpoints/registry.mjs';
const routes = [
    { path: /\/config\/get/g, name: /active-object-config-get/g },
    { path: /\/class\/get/g, name: /active-object-class-get/g },
    { path: /\/config\/create/g, name: /active-object-config-create/g },
    { path: /\/class\/create/g, name: /active-object-class-create/g },
    { path: /\/config\/delete/g, name: /active-object-config-delete/g },
    { path: /\/class\/delete/g, name: /active-object-class-delete/g }
];
export class Routing {
    /**
     * 
     * @param {RegExp} path
     * @param {String} content
     * @param {Object} headers
     * @returns 
     */
    async handle({ path, content, headers }) {
        const { $logging, $utils } = new Container();
        const registry = new ContainerRegistry();
        const container = new Container();
        try {
            let versionMatch = /\/v[0-9]+\//g.exec(path);
            let requestedVersion = 'v1';
            if (versionMatch.length > 0) {
                requestedVersion = versionMatch[0].replace(/\//g,'');
            }
            requestedVersion = Object.keys(allEndpoints).find(key => key === requestedVersion);
            const endpointsByVersion = allEndpoints[requestedVersion];
            const endpointNames = Object.keys(endpointsByVersion);
            for(const name of endpointNames) {
                const type = endpointsByVersion[name];
                registry.registerSingleton({ type, args: { content, headers } });
            }
            const registeredTypes = registry.getRegisteredTypes()
                                        .filter(rt => endpointNames.find(en => `$${en.toLowerCase()}` === rt.ref.toLowerCase()));
            for(const { ref } of registeredTypes) {
                for (const exp of routes) {
                    exp.path.lastIndex = -1;
                    exp.name.lastIndex = -1;
                    if (exp.path.test(path)) {
                        const activatedEndpoint = container[ref];
                        if (exp.name.test(activatedEndpoint.name)) {
                            return await activatedEndpoint.handle();
                        }
                    }
                }
            }
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: $utils.getJSONString({ message: 'endpoint not found.' })
            };
         } catch(error) {
            $logging.log({ error });
            return {
                contentType: 'application/json',
                statusCode: 500,
                statusMessage: '500 Internal Server Error',
                responseContent: $utils.getJSONString({ message: 'critical error in routing' })
            };
        }
    }
}
