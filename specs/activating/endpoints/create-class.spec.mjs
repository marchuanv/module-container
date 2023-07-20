import { v1Endpoints } from '../../../lib/registry.mjs';
describe('when-activating-create-class-endpoint', () => {
    let instance;
    beforeAll(async () => {
        instance = new v1Endpoints.CreateClassEndpoint({
            path: '/api/v1/class/create',
            content: `class HelloWorld 
                {
                    sayHello() { console.log('Hello');
                }
            }`,
            token: process.env.GIT
        });
    });
    it('should get an instance', () => {
        expect(instance).toBeDefined();
    });
    it('should have a matchPath member', () => {
        expect(instance.matchPath).toBeDefined();
    });
});