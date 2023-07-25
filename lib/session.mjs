import { Container } from './registry.mjs';
import utils from 'utils';
export class Session extends Container {
    constructor({ username, authToken }) {
        super({
            members: {
                username: {
                    value: username
                },
                authToken: {
                    value: authToken
                },
            }
        });
    }
    async isAuthorised() {
        const username = await this.username;
        const authToken = await this.authToken;
        return false;
    }
}
