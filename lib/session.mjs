import { Container, User } from './registry.mjs';
import utils from 'utils';
export class Session extends Container {
    constructor({ username, sessionAuthToken, sessionAuthToken, storeAuthToken, hashedPassphrase }) {
        super({
            members: {
                sessionAuthToken: {
                    value: sessionAuthToken
                },
                user: {
                    class: { User },
                    args: { username, sessionAuthToken, hashedPassphrase, storeAuthToken }
                }
            },
            setup: {
                args: {},
                callback: async function () {
                    const user = await this.user;
                    if (!(await user.isAuthenticated())) {
                        await user.authenticate();
                    }
                }
            }
        });
    }
    async isAuthorised() {
        const user = await this.user;
        if ((await user.isAuthenticated())) {
            return true;
        }
        return false;
    }
}
