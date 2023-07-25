import { Container, Store } from './registry.mjs';
import utils from 'utils';
const authenticatedUsers = new Map();
export class User extends Container {
    constructor({ username, hashedPassphrase, gitAuthToken }) {
        const filePath = `${username}.json`;
        super({
            members: {
                username: {
                    value: username
                },
                hashedPassphrase: {
                    value: hashedPassphrase
                },
                store: {
                    class: { Store },
                    args: {
                        filePath,
                        gitAuthToken
                    }
                },
                setup: {
                    args: { username },
                    callback: async ({ username }) => {
                        authenticatedUsers.delete(username);
                        authenticatedUsers.set(username, false);
                    }
                }
            }
        });
    }
    async authenticate() {
        if (!(await this.isAuthenticated())) {
            const store = await this.store;
            const username = await this.username;
            let content = await store.read();
            content = utils.getJSONObject(content);
            const { hashedPassphrase } = content[username];
            const _hashedPassphrase = await this.hashedPassphrase;
            if (hashedPassphrase && _hashedPassphrase && _hashedPassphrase === hashedPassphrase) {
                authenticatedUsers.delete(username);
                authenticatedUsers.set(username, true);
            }
        }
        return await this.isAuthenticated();
    }
    async isAuthenticated() {
        const username = await this.username;
        return authenticatedUsers.get(username);
    }
}
