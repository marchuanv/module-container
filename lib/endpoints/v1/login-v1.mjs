import { Container, Session } from '../../registry.mjs';
export class Login extends Container {
    constructor({ username, secret }) {
        super({
            members: {
                username: {
                    value: username
                },
                secret: {
                    value: secret
                },
                session: {
                    class: {Session},
                    args: { username, secret }
                }
            }
        });
    }
    async matchPath() {
        const path = await this.path;
        const pathMatch = /\/api\/v1\/login/g;
        return pathMatch.test(path);
    }
    async handle() {
        const session = await this.session;
        const username = await this.username;
        if (session.authenticate()) {

        }
        return {
            contentType: 'application/json',
            statusCode: 401,
            statusMessage: '401 Unauthorised',
            responseContent: utils.getJSONString({ message: `${username} is not authorised` })
        };
    }
}
