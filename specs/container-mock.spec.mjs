import { ContainerConfigTemplate } from '../lib/container-config-template.mjs';
import { ContainerConfig } from '../lib/container-config.mjs';
import { Container } from '../lib/container.mjs';
import { ClassMember } from '../lib/member/class-member.mjs';
const configTemplate = new ContainerConfigTemplate();
const containerConfig = new ContainerConfig(configTemplate, {
    container: {
        testClassA: {
            args: {},
            ctor: async () => { },
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            classMock: {},
            referenceProperties: {
                referencePropertyTestClassB: {
                    args: {},
                    class: { testClassB: {} },
                    isPublic: true
                }
            },
            staticProperties: {},
            methods: {}
        },
        testClassB: {
            args: {},
            ctor: async () => { },
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            classMock: { testClassBMock: {} },
            referenceProperties: {},
            staticProperties: {},
            methods: {}
        },
        testClassBMock: {
            args: {},
            ctor: async () => { },
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            classMock: {},
            referenceProperties: {},
            staticProperties: {},
            methods: {}
        }
    }
});
const container = new Container(containerConfig);
fdescribe('when creating a ClassMember given classMock configuration', () => {
    it('should create an instance of the mocked Class instead', async () => {
        let error;
        let testClassBMockInstance;
        try {
            const instance = await container.getReference('testClassA');
            testClassBMockInstance = await instance.referencePropertyTestClassB;
        } catch (err) {
            error = err;
            console.log(err);
        }
        expect(error).not.toBeDefined();
        expect(testClassBMockInstance).toBeDefined();
        expect(testClassBMockInstance.Id).toBeDefined();
        expect(testClassBMockInstance.Id.name).toEqual('testClassBMock');
        expect(testClassBMockInstance.Id.prototype).toEqual(ClassMember);
    });
});