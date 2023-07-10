import { Container } from './registry.mjs';
import { allEndpoints } from './endpoints/registry.mjs';
export class Route extends Container {
    constructor({ path, content, token }) {
        super({
            endpoints: {
                allEndpoints,
                ctorArgs: { path, content, token }
            }
        });
    }
    async handle() {
        try {
            if (await this.endpoint.matchPath(this.path)) {
                return await this.endpoint.handle();
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
