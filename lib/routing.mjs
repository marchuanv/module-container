import { Container, ContainerRegistry } from './registry.mjs';
import { allEndpoints } from './endpoints/registry.mjs';

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
            if (versionMatch.length > 0) {
                let requestedVersion = versionMatch[0].replace(/\//g, '');
                if (Object.keys(allEndpoints).find(key => key === requestedVersion)) {
                    const endpointsByVersion = allEndpoints[requestedVersion];
                    const endpointNames = Object.keys(endpointsByVersion);
                    for (const name of endpointNames) {
                        const type = endpointsByVersion[name];
                        registry.registerSingleton({ type, args: { path, content, headers } });
                    }
                    const registeredTypes = registry.getRegisteredTypes()
                        .filter(rt => endpointNames.find(en => `$${en.toLowerCase()}` === rt.ref.toLowerCase()));
                    for (const { ref } of registeredTypes) {
                        const activatedEndpoint = container[ref];
                        if (activatedEndpoint.matchPath()) {
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
        } catch (error) {
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
