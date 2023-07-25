import { Container, Store } from './registry.mjs';
import utils from 'utils';
const users = new Map();
export class User extends Container {
    constructor({ username, sessionAuthToken, hashedPassphrase, passphrase, storeAuthToken }) {
        const filePath = `${username}.json`;
        super({
            members: {
                username: {
                    value: username
                },
                store: {
                    class: { Store },
                    args: {
                        filePath,
                        storeAuthToken
                    }
                },
                setup: {
                    args: {},
                    callback: async () => {
                        users.delete(username);
                        const store = await this.store;
                        let content = await store.read();
                        content = utils.getJSONObject(content);
                        const { storedHashedPassphrase, storedHashedPassphraseSalt, storedDecryptionKey } = content[username] || {};
                        if (!storedHashedPassphrase || !storedDecryptionKey || !storedHashedPassphraseSalt) {
                            throw new Error('failed to load user');
                        }
                        let sessionAuth = null;
                        if (sessionAuthToken) {
                            sessionAuth = utils.base64ToString(sessionAuthToken);
                            sessionAuth = utils.getJSONObject(sessionAuth);
                        }
                        users.set(username, {
                            sessionAuth,
                            hashedPassphrase,
                            storedHashedPassphrase,
                            storedHashedPassphraseSalt,
                            storedDecryptionKey,
                            passphrase,
                            authenticated: false
                        });
                    }
                }
            }
        });
    }
    async authenticate() {
        if (!(await this.isAuthenticated())) {
            const username = await this.username;
            const user = users.get(username);
            user.authenticated = false;
            const { sessionAuth, hashedPassphrase, passphrase, storedHashedPassphrase, storedHashedPassphraseSalt, storedDecryptionKey } = user;
            if (sessionAuth && sessionAuth.token && storedHashedPassphrase && storedDecryptionKey && sessionAuth.username === username) {
                const decrypted = utils.decryptFromBase64Str(sessionAuth.token, storedDecryptionKey, storedHashedPassphrase);
                if (decrypted.username === username && decrypted.hashPassphrase === storedHashedPassphrase) {
                    user.authenticated = true;
                }
            } else if (passphrase && storedHashedPassphraseSalt && storedHashedPassphrase) {
                const _hashedPassphrase = utils.hashPassphrase(passphrase, storedHashedPassphraseSalt);
                if (_hashedPassphrase === storedHashedPassphrase) {
                    user.authenticated = true;
                }
            } else if (hashedPassphrase && storedHashedPassphrase && hashedPassphrase === storedHashedPassphrase) {
                user.authenticated = true;
            }
        }
        return await this.isAuthenticated();
    }
    async isAuthenticated() {
        const username = await this.username;
        const { authenticated } = users.get(username);
        return authenticated;
    }
}
