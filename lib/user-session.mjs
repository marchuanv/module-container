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
        const user = users.get(username);
        let { storedHashedPassphrase, storedHashedPassphraseSalt, storedDecryptionKey, storedEncryptionKey, passphrase } = user;
        if (!storedHashedPassphrase || !storedHashedPassphraseSalt || !storedDecryptionKey) {
            ({ hashedPassphraseSalt: storedHashedPassphraseSalt, hashedPassphrase: storedHashedPassphrase } = utils.hashPassphrase(passphrase));
            ({ privateKey: storedDecryptionKey, publicKey: storedEncryptionKey } = utils.generatePublicPrivateKeys(storedHashedPassphrase));
            const content = {};
            user.storedHashedPassphrase = storedHashedPassphrase;
            user.storedHashedPassphraseSalt = storedHashedPassphraseSalt;
            user.storedDecryptionKey = storedDecryptionKey;
            user.storedEncryptionKey = storedEncryptionKey;
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
                const { hashedPassphrase } = utils.hashPassphrase(passphrase, storedHashedPassphraseSalt);
                if (hashedPassphrase === storedHashedPassphrase) {
                    const sessionAuth = { token: { hashedPassphrase }, username };
                    sessionAuth.token = utils.encryptToBase64Str(utils.getJSONString(sessionAuth.token), storedEncryptionKey);
                    user.sessionAuth = sessionAuth;
                }
            }
        }
        return await this.isAuthenticated();
    }
    async getAuthToken() {
        const username = await this.username;
        const { sessionAuth } = users.get(username);
        return utils.stringToBase64(utils.getJSONString(sessionAuth));
    }
    async isAuthenticated() {
        const username = await this.username;
        const user = users.get(username);
        const { storedHashedPassphrase, storedDecryptionKey, sessionAuth } = user;
        if (storedHashedPassphrase && storedDecryptionKey && sessionAuth) {
            let decrypted = utils.decryptFromBase64Str(sessionAuth.token, storedDecryptionKey, storedHashedPassphrase );
            decrypted = utils.getJSONObject(decrypted);
            if (sessionAuth.username === username && decrypted.hashedPassphrase === storedHashedPassphrase) {
                return true;
            }
        }
        return false;
    }
}
