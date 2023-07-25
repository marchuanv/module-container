import { Container } from './registry.mjs';
import utils from 'utils';
export class Session extends Container {
    constructor({ authToken }) {
        super({
            members: {
                authToken: {
                    value: authToken
                },
            }
        });
    }
    async isAuthorised() {
        const authToken = await this.authToken;
        return false;
    }
}
