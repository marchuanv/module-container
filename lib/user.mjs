import { Container, Store } from './registry.mjs';
import utils from 'utils';
const authenticatedUsers = new Map();
export class User extends Container {
    constructor({ username, hashedPassphrase, gitAuthToken }) {
        const filePath = 'users.json';
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
                }
            }
        });
    }
    async authenticate() {
        const store = await this.store;
        const username = await this.username;
        authenticatedUsers.delete(username);
        let content = await store.read();
        content = utils.getJSONObject(content);
        const { hashedPassphrase } = content[username];
        const _hashedPassphrase = await this.hashedPassphrase;
        if (hashedPassphrase && _hashedPassphrase && _hashedPassphrase === hashedPassphrase) {
            authenticatedUsers.set(username, true);
        }
        return authenticatedUsers.has(username);
    }
    async isAuthenticated() {
        const username = await this.username;
        return authenticatedUsers.has(username);
    }
}
