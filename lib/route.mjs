import { Container } from './registry.mjs';
import { allEndpoints } from './endpoints/registry.mjs';

export class Route extends Container {
    constructor({ path, content, headers }) {
        super();
        for (const version of Object.keys(allEndpoints)) {
            const endpointsByVersion = allEndpoints[version];
            const endpointNames = Object.keys(endpointsByVersion);
            for (const name of endpointNames) {
                const type = endpointsByVersion[name];
                const { ref } = this.register({ Class: type, args: { path, content, headers } });
                const endpoint = this[ref];
                if (endpoint.matchPath()) {
                    this.bag.endpoint = endpoint;
                }
            }
        }
    }
    async handle() {
        try {
            if (this.bag.endpoint) {
                return await this.bag.endpoint.handle();
            }
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: this.utils.getJSONString({ message: 'endpoint not found.' })
            };
        } catch (error) {
            this.logging.log({ error });
            return {
                contentType: 'application/json',
                statusCode: 500,
                statusMessage: '500 Internal Server Error',
                responseContent: this.utils.getJSONString({ message: 'critical error in routing' })
            };
        }
    }
}
