import { Container, v1Endpoints } from './registry.mjs';
import utils from 'utils';
export class Route extends Container {
    constructor({ path, content, token }) {
        super({
            endpoints: {
                type: v1Endpoints,
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

        const endpoints = await this.endpoints;
        const path = await this.path;
        const utils = await this.utils;

        for (const endpoint of endpoints) {
            if (await endpoint.matchPath(path)) {
                return await endpoint.handle();
            }
        }
        return {
            contentType: 'application/json',
            statusCode: 404,
            statusMessage: '404 Not Found',
            responseContent: utils.getJSONString({ message: 'endpoint not found.' })
        };
    }
}
