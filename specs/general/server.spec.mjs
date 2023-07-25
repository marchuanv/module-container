import { ActiveObjectServer, Route } from '../../lib/registry.mjs';
fdescribe('when-creating-an-active-object-server-given-a-request-for-geting-config', () => {
    let response;
    beforeAll(async () => {
        const server = new ActiveObjectServer();
        await server.start();
        response = await fetch(`http://localhost:${process.env.PORT || 80}/api/v1/config/get`,{ 
            method: 'GET',
            headers: {
               username: 'JoE' 
            }});
    });
    it('should handle request and setup a route', async () => {
        expect(response).toBeDefined();
        expect(response.status).toBe(404);
    });
});