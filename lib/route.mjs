import { Container, Logging } from './registry.mjs';
import { allEndpoints } from './endpoints/registry.mjs';
import utils from 'utils';
export class Route extends Container {
    constructor({ path, content, token }) {
        const endpointsForVersion = allEndpoints.v1;
        super({
            logging: {
                type: { Logging },
                args: { logLevel: 'info' }
            },
            endpoints: {
                type: endpointsForVersion,
                args: { path, content, token }
            },
            utils: {
                name: 'utils',
                value: utils
            },
            path: {
                name: 'path',
                value: path
            }
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
            await this.logging.log({ error });
            return {
                contentType: 'application/json',
                statusCode: 500,
                statusMessage: '500 Internal Server Error',
                responseContent: this.utils.getJSONString({ message: 'critical error in routing' })
            };
        }
    }
}
