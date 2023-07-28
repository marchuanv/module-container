import { SpecsHelper } from '../../specs-helper.mjs';

fdescribe('when making a request for get class given a started active object server', () => {
    it('should instruct route to handle the request and respond with class not found', async () => {
        const response = await SpecsHelper.activeObjectServerHttpGetClass();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.statusText).toBe('404 Not Found');
        expect(response.status).toBe(404);
        expect(content.message).toBe('active-object-class.js was not found');
    });
});
fdescribe('when making a request for get class given a started active object server and the class exists', () => {
    it('should instruct route to handle the request and respond with class found', async () => {
        const response = await SpecsHelper.activeObjectServerHttpGetClassExists();
        const content = await response.text();
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.statusText).toBe('200 Success');
        expect(content).toBe('{\n    "message": "Success",\n    "content": "class HelloWorld { sayHello() { console.log("hello"); }}"\n}');
    });
});
fdescribe('when making a request for create class given a started active object server', () => {
    it('should instruct route to handle the request and respond with class created', async () => {
        const response = await SpecsHelper.activeObjectServerHttpCreateClass();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.statusText).toBe('200 Success');
        expect(content.message).toBe('active-object-class.js was created');
    });
});
fdescribe('when making a request for create class given a started active object server and the class exists', () => {
    it('should instruct route to handle the request and respond with class exists', async () => {
        const response = await SpecsHelper.activeObjectServerHttpCreateClassExists();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(409);
        expect(response.statusText).toBe('409 Conflict');
        expect(content.message).toBe('active-object-class.js already exist');
    });
});
fdescribe('when making a request for delete class given a started active object server', () => {
    it('should instruct route to handle the request and respond with class not found', async () => {
        const response = await SpecsHelper.activeObjectServerHttpDeleteClass();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(404);
        expect(response.statusText).toBe('404 Not Found');
        expect(content.message).toBe('active-object-class.js was not found');
    });
});
fdescribe('when making a request to delete a class given a started active object server and the class exists', () => {
    it('should instruct route to handle the request and respond with class deleted', async () => {
        const response = await SpecsHelper.activeObjectServerHttpDeleteClassExists();
        const content = await response.json();
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.statusText).toBe('200 Success');
        expect(content.message).toBe('active-object-class.js was removed');
    });
});