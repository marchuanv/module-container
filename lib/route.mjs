import { Container } from './registry.mjs';
import { allEndpoints } from './endpoints/registry.mjs';

export class Route extends Container {
    constructor({ path, content, token }) {
        super();
        for (const version of Object.keys(allEndpoints)) {
            const endpointsByVersion = allEndpoints[version];
            const endpointNames = Object.keys(endpointsByVersion);
            for (const name of endpointNames) {
                const type = endpointsByVersion[name];
                const { ref } = this.addDependency({ Class: type, args: { path, content, token } });
                const endpoint = this[ref];
                if (endpoint.matchPath()) {
                    this.bag.endpoint = endpoint;
                }
            }
        }
    }
    async handle() {
        try {
            const { endpoint } = this.bag;
            if (endpoint) {
                return await endpoint.handle();
            }
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: (await this.utils).getJSONString({ message: 'endpoint not found.' })
            };
        } catch (error) {
            return {
                contentType: 'application/json',
                statusCode: 500,
                statusMessage: '500 Internal Server Error',
                responseContent: (await this.utils).getJSONString({ message: 'critical error in routing' })
            };
        }
    }
}
