import { Container } from './registry.mjs';
import { allEndpoints } from './endpoints/registry.mjs';
import utils from 'utils';
export class Route extends Container {
    constructor({ path, content, token }) {
        super({
            endpoints: {
                type: allEndpoints,
                args: { path, content, token }
            },
            endpoints2: {
                type: allEndpoints,
                args: { path, content, token }
            },
            utils
        });
    }
    async handle() {
        try {
            for (const endpoint of this.endpoints) {
                if (await endpoint.matchPath(this.path)) {
                    return await endpoint.handle();
                }
            }
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: this.utils.getJSONString({ message: 'endpoint not found.' })
            };
        } catch (error) {
            return {
                contentType: 'application/json',
                statusCode: 500,
                statusMessage: '500 Internal Server Error',
                responseContent: this.utils.getJSONString({ message: 'critical error in routing' })
            };
        }
    }
}
