import { Container, User } from './registry.mjs';
import utils from 'utils';
export class Session extends Container {
    constructor({ username, authToken }) {
        super({
            members: {
                authToken: {
                    value: authToken
                },
                user: {
                    class: { User },
                    args: { username, authToken }
                }
            },
            setup: {
                args: { username, authToken },
                callback: ({ username, authToken }) => {

                }
            }
        });
    }
    async isAuthorised() {
        const authToken = await this.authToken;
        return false;
    }
}
