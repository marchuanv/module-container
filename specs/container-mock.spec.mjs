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
            classMock: { testClassBMock: {} },
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
const container = new Container(containerConfig);
fdescribe('when creating a ClassMember given classMock configuration', () => {
    it('should create an instance of the mocked Class instead', async () => {
        let error;
        let testClassBInstance;
        let testClassCInstance;
        try {
            const instance = await container.getReference('testClassA');
            testClassBInstance = await instance.referencePropertyTestClassB;
            testClassCInstance = await testClassBInstance.referencePropertyTestClassC;
        } catch (err) {
            error = err;
            console.log(err);
        }
        expect(error).not.toBeDefined();

        expect(testClassBInstance).toBeDefined();
        expect(testClassCInstance).toBeDefined();

        expect(testClassBInstance.Id).toBeDefined();
        expect(testClassCInstance.Id).toBeDefined();

        expect(testClassBInstance.Id.name).toEqual('testClassB');
        expect(testClassCInstance.Id.name).toEqual('testClassC');

        expect(testClassBInstance.Id.prototype).toEqual(ClassMember);
        expect(testClassCInstance.Id.prototype).toEqual(ClassMember);

        expect(testClassBInstance.referencePropertyTestClassB).toBeDefined();
    });
});