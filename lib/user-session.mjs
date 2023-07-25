import { Container, Store } from './registry.mjs';
import utils from 'utils';
const users = new Map();
export class UserSession extends Container {
    constructor({ username, sessionAuthToken, hashedPassphrase, passphrase, storeAuthToken }) {
        const _username = username.toLowerCase();
        const filePath = `${_username}.json`;
        super({
            members: {
                username: {
                    value: _username
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
                        users.delete(_username);
                        const store = await this.store;
                        let { storedHashedPassphrase, storedHashedPassphraseSalt, storedDecryptionKey, storedEncryptionKey, sessionAuth } = {};
                        if ((await store.exists())) {
                            let content = await store.read();
                            content = utils.getJSONObject(content);
                            ({ storedHashedPassphrase, storedHashedPassphraseSalt, storedDecryptionKey, storedEncryptionKey } = content[_username]);
                            if (sessionAuthToken) {
                                sessionAuth = utils.base64ToString(sessionAuthToken);
                                sessionAuth = utils.getJSONObject(sessionAuth);
                            }
                        } 
                        users.set(_username, {
                            sessionAuth,
                            hashedPassphrase,
                            storedHashedPassphrase,
                            storedHashedPassphraseSalt,
                            storedDecryptionKey,
                            storedEncryptionKey,
                            passphrase
                        });
                    }
                }
            }
        });
    }
    async register() {
        const store = await this.store;
        const username = await this.username;
        let { storedHashedPassphrase, storedHashedPassphraseSalt, storedDecryptionKey, storedEncryptionKey, passphrase } = users.get(username);
        if (!storedHashedPassphrase || !storedHashedPassphraseSalt || !storedDecryptionKey) {
            ({ hashedPassphraseSalt: storedHashedPassphraseSalt, hashedPassphrase: storedHashedPassphrase } = utils.hashPassphrase(passphrase));
            ({ privateKey: storedDecryptionKey, publicKey: storedEncryptionKey } = utils.generatePublicPrivateKeys(storedHashedPassphrase));
            const content = {};
            content[username] = {
                storedHashedPassphrase,
                storedHashedPassphraseSalt,
                storedDecryptionKey,
                storedEncryptionKey
            };
            await store.write({ content });
            return true;
        }
        return false;
    }
    async authenticate() {
        if (!(await this.isAuthenticated())) {
            const username = await this.username;
            const user = users.get(username);
            const { passphrase, storedHashedPassphrase, storedHashedPassphraseSalt, storedDecryptionKey, storedEncryptionKey } = user;
            if (passphrase && storedHashedPassphrase && storedHashedPassphraseSalt && storedDecryptionKey && storedEncryptionKey) {
                const _hashedPassphrase = utils.hashPassphrase(passphrase, storedHashedPassphraseSalt);
                if (_hashedPassphrase === storedHashedPassphrase) {
                    const sessionAuth = { token: { hashPassphrase: _hashedPassphrase }, username };
                    sessionAuth.token = utils.encryptToBase64Str(utils.getJSONString(sessionAuth.token), storedEncryptionKey);
                }
            }
        }
        return await this.isAuthenticated();
    }
    async isAuthenticated() {
        const username = await this.username;
        const user = users.get(username);
        const { storedHashedPassphrase, storedDecryptionKey, sessionAuth } = user;
        if (storedHashedPassphrase && storedDecryptionKey) {
            const decrypted = utils.decryptFromBase64Str(sessionAuth.token, storedHashedPassphrase, storedDecryptionKey );
            if (sessionAuth.username === username && decrypted.hashPassphrase === storedHashedPassphrase) {
                return true;
            }
        }
        return false;
    }
}
