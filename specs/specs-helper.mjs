import { UserSession, Store, Route, ActiveObjectServer } from '../lib/registry.mjs';
export class SpecsHelper {
    static async getStoreToken() {
        return process.env.GIT;
    }
    static HandleFetchRespond(response) {
        new Promise((resolve, reject) => {
            const dest = fs.createWriteStream(`filename.mp3`);
            response.body.pipe(dest);
            response.body.on('end', () => resolve());
            dest.on('error', reject);
        })
    }
    static async getUserSessionToken(args = { username: 'Joe', passphrase: 'Joe1234' }) {
        args.storeAuthToken = await SpecsHelper.getStoreToken();
        const userSession = new UserSession(args);
        const isAlreadyRegistered = await userSession.isRegistered();
        if (isAlreadyRegistered) {
            return await userSession.authenticate();
        } else {
            await userSession.register();
            return await userSession.authenticate();
        }
    }
    static async clearStore({ filePath }) {
        const store = new Store({ filePath, storeAuthToken: process.env.GIT });
        await store.remove();
    }
    static async ctorGetConfigRoute(args = { username: 'Joe', passphrase: 'Joe1234' }) {
        args.sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        args.path = '/api/v1/config/get';
        args.storeAuthToken = await SpecsHelper.getStoreToken();
        return new Route(args);
    }
    static async ctorGetClassRoute(args = { username: 'Joe', passphrase: 'Joe1234' }) {
        args.sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        args.path = '/api/v1/class/get';
        args.storeAuthToken = await SpecsHelper.getStoreToken();
        return new Route(args);
    }
    static async ctorCreateConfigRoute(args = { username: 'Joe', passphrase: 'Joe1234', content: { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false } }) {
        args.sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        args.path = '/api/v1/config/create';
        args.storeAuthToken = await SpecsHelper.getStoreToken();
        args.content = JSON.stringify(content);
        return new Route(args);
    }
    static async ctorCreateClassRoute(args = { username: 'Joe', passphrase: 'Joe1234', content: `class HelloWorld { sayHello() { console.log("hello"); }}` }) {
        args.sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        args.path = '/api/v1/class/create';
        args.storeAuthToken = await SpecsHelper.getStoreToken();
        args.content = JSON.stringify(content);
        return new Route(args);
    }

    static async activeObjectServerHttpGetConfig(clearStore = true, args = { username: 'Joe', passphrase: 'Joe1234' }) {
        if (clearStore) { 
            await SpecsHelper.clearStore({ filePath: 'active-object-config.json' });
        }
        const sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        const url = `http://localhost:${process.env.PORT || 80}/api/v1/config/get`;
        const headers = { username: args.username, sessionAuthToken };
        const method = 'GET';
        const server = new ActiveObjectServer();
        await server.start();
        const response = await fetch(url, { method, headers });
        await server.stop();
        return response;
    }
    static async activeObjectServerHttpCreateConfig(clearStore = true, args = { username: 'Joe', passphrase: 'Joe1234', content: { className: 'HelloWorld', language: 'JavaScript', dependencyInjection: false } }) {
        if (clearStore) { 
            await SpecsHelper.clearStore({ filePath: 'active-object-config.json' });
        }
        const sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        const url = `http://localhost:${process.env.PORT || 80}/api/v1/config/create`;
        const headers = { username: args.username, sessionAuthToken };
        const method = 'PUT';
        const server = new ActiveObjectServer();
        await server.start();
        const response = await fetch(url, { method, headers, body: JSON.stringify(args.content) });
        await server.stop();
        return response;
    }
    static async activeObjectServerHttpDeleteConfig(clearStore = true, args = { username: 'Joe', passphrase: 'Joe1234' }) {
        if (clearStore) {
            await SpecsHelper.clearStore({ filePath: 'active-object-config.json' });
        }
        const sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        const url = `http://localhost:${process.env.PORT || 80}/api/v1/config/delete`;
        const headers = { username: args.username, sessionAuthToken };
        const method = 'DELETE';
        const server = new ActiveObjectServer();
        await server.start();
        const response = await fetch(url, { method, headers, body: JSON.stringify(args.content) });
        await server.stop();
        return response;
    }
    static async activeObjectServerHttpGetConfigExists() {
        await SpecsHelper.activeObjectServerHttpCreateConfig(true);
        return await SpecsHelper.activeObjectServerHttpGetConfig(false);
    }
    static async activeObjectServerHttpCreateConfigExists() {
        await SpecsHelper.activeObjectServerHttpCreateConfig(true);
        return SpecsHelper.activeObjectServerHttpCreateConfig(false);
    }
    static async activeObjectServerHttpDeleteConfigExists() {
        await SpecsHelper.activeObjectServerHttpCreateConfig(true);
        return await SpecsHelper.activeObjectServerHttpDeleteConfig(false);
    }

    static async activeObjectServerHttpGetClass(clearStore = true, args = { username: 'Joe', passphrase: 'Joe1234' }) {
        if (clearStore) {
            await SpecsHelper.clearStore({ filePath: 'active-object-class.js' });
        }
        const sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        const url = `http://localhost:${process.env.PORT || 80}/api/v1/class/get`;
        const headers = { username: args.username, sessionAuthToken };
        const method = 'GET';
        const server = new ActiveObjectServer();
        await server.start();
        const response = await fetch(url, { method, headers });
        await server.stop();
        return response;
    }
    static async activeObjectServerHttpCreateClass(clearStore = true, args = { username: 'Joe', passphrase: 'Joe1234', content: `class HelloWorld { sayHello() { console.log("hello"); }}` }) {
        if (clearStore) {
            await SpecsHelper.clearStore({ filePath: 'active-object-class.js' });
        }
        const sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        const url = `http://localhost:${process.env.PORT || 80}/api/v1/class/create`;
        const headers = { username: args.username, sessionAuthToken };
        const method = 'PUT';
        const server = new ActiveObjectServer();
        await server.start();
        const response = await fetch(url, { method, headers, body: args.content });
        await server.stop();
        return response;
    }
    static async activeObjectServerHttpDeleteClass(clearStore = true, args = { username: 'Joe', passphrase: 'Joe1234' }) {
        if (clearStore) {
            await SpecsHelper.clearStore({ filePath: 'active-object-class.js' });
        }
        const sessionAuthToken = await SpecsHelper.getUserSessionToken(args);
        const url = `http://localhost:${process.env.PORT || 80}/api/v1/class/delete`;
        const headers = { username: args.username, sessionAuthToken };
        const method = 'DELETE';
        const server = new ActiveObjectServer();
        await server.start();
        const response = await fetch(url, { method, headers, body: args.content });
        await server.stop();
        return response;
    }
    static async activeObjectServerHttpGetClassExists() {
        await SpecsHelper.activeObjectServerHttpCreateClass(true);
        return await SpecsHelper.activeObjectServerHttpGetClass(false);
    }
    static async activeObjectServerHttpCreateClassExists() {
        await SpecsHelper.activeObjectServerHttpCreateClass(true);
        return SpecsHelper.activeObjectServerHttpCreateClass(false);
    }
    static async activeObjectServerHttpDeleteClassExists() {
        await SpecsHelper.activeObjectServerHttpCreateClass(true);
        return await SpecsHelper.activeObjectServerHttpDeleteClass(false);
    }
}
