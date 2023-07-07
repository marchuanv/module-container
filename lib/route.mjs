import { Container } from './registry.mjs';
import { allEndpoints } from './endpoints/registry.mjs';
import utils from 'utils'
export class Route extends Container {
    constructor({ path, content, token }) {
        super();
        for (const version of Object.keys(allEndpoints)) {
            const endpointsByVersion = allEndpoints[version];
            const endpointNames = Object.keys(endpointsByVersion);
            for (const name of endpointNames) {
                const type = endpointsByVersion[name];
                const config = {};
                config[name] = {};
                config[name][type];
                config[name][type.name] = type;
                config[name].ctorArgs = {
                    path,
                    content,
                    token
                };
                config[name].utils = utils;
                this.dependency(config);
            }
        }
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