import { Container } from './registry.mjs';
import utils from 'utils';
export class Session extends Container {
    constructor({ username, secret }) {
        super({
            members: {
                username: { 
                    value: username
                },
                secret: { 
                    value: secret
                },
                salt: {
                    value: '04fad22510d8a94e'
                },
                hashed: {
                    value: '87a907cbd5113bda0386ac248393375acb7fd79ef564c1a94e030d41c02f1bf005ef9c6dbe8d799cb7a9bee613e0faacb6c98c2d2899e750f32ff925ec931aa3'
                }
            }
        });
    }
    async authenticate() {
        const username = await this.username;
        const secret = await this.secret;
        const salt = await this.salt;
        const hashed = await this.hashed;
        const { hashedPassphrase } = utils.hashPassphrase(secret, salt);
        if (hashed === hashedPassphrase) {
            return true;
        }
        return false;
    }
}
