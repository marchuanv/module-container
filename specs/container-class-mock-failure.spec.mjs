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
            classMock: {},
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
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
            classMock: {},
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            referenceProperties: {},
            staticProperties: {},
            methods: {}
        },
        testClassBMock: {
            args: {},
            ctor: async () => { },
            classMock: {},
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            referenceProperties: {
                referencePropertyTestClassC: {
                    args: {},
                    class: { testClassC: {} },
                    isPublic: true
                }
            },
            staticProperties: {},
            methods: {}
        },
        testClassC: {
            args: {},
            ctor: async () => { },
            classMock: {},
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            referenceProperties: {},
            staticProperties: {},
            methods: {}
        }
    }
});
describe('when creating a ClassMember given NO classMock configuration', () => {
    it('should not create an instance of the mocked Class', async () => {
        const container = new Container(containerConfig);
        let error;
        let testClassBInstance;
        try {
            const instance = await container.getReference('testClassA');
            testClassBInstance = await instance.referencePropertyTestClassB;
        } catch (err) {
            error = err;
            console.log(err);
        }
        expect(error).not.toBeDefined();
        expect(testClassBInstance).toBeDefined();
        expect(testClassBInstance).toBeInstanceOf(ClassMember);
        expect(testClassBInstance.Id).toBeDefined();
        expect(testClassBInstance.Id.name).toEqual('testClassB');
        expect(testClassBInstance.Id.prototype).toEqual(ClassMember);
        expect(testClassBInstance.referencePropertyTestClassC).not.toBeDefined();
    });
});