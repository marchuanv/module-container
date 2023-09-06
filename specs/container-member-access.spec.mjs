import { ContainerConfigTemplate } from '../lib/container-config-template.mjs';
import { ContainerConfig } from '../lib/container-config.mjs';
import { Container } from '../lib/container.mjs';
import { ClassMember } from '../lib/member/class-member.mjs';
const configTemplate = new ContainerConfigTemplate();
const containerConfig = new ContainerConfig(configTemplate, {
    container: {
        testClass: {
            args: {},
            ctor: async function (args) { },
            classMock: {},
            isInterface: false,
            isSingleton: false,
            isHaltOnErrors: true,
            isPublic: true,
            referenceProperties: {
                testClassPublicProperty: {
                    args: {},
                    class: { testClassA: {} },
                    isPublic: true
                },
                testClassPrivateProperty: {
                    args: {},
                    class: { testClassB: {} },
                    isPublic: false
                }
            },
            staticProperties: {
                testClassPublicStaticValue: {
                    value: { message: 'this is static public property' },
                    isPublic: true
                },
                testClassPrivateStaticValue: {
                    value: { message: 'this is static private property' },
                    isPublic: false
                }
            },
            methods: {
                testClassFunctionPublic: {
                    args: {},
                    callback: async function (args) {
                        return await this.testClassPrivateProperty
                    },
                    isPublic: true
                },
                testClassFunctionPrivate: {
                    args: {},
                    callback: async function (args) {
                        return await this.testClassPrivateProperty
                    },
                    isPublic: false
                }
            }
        },
        testClassA: {
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
        }
    }
});
fdescribe('when directly accessing a private member of a class', () => {
    it('should raise member access security error and not return anything', async () => {
        const container = new Container(containerConfig);
        let error;
        let testClassAInstance;
        let testClassAInstance2;
        try {
            const instance = await container.getReference('testClass');
            testClassAInstance2 = await instance.testClassFunctionPublic();
            testClassAInstance = await instance.testClassPrivateProperty;
        } catch (err) {
            error = err;
            console.log(err);
        }
        expect(testClassAInstance2).toBeDefined();
        expect(testClassAInstance).not.toBeDefined();
        expect(error).toBeDefined();
        expect(error.message).toBe('testClassPrivateProperty is private or not called from a valid context');
    });
});
describe('when directly accessing a public member of a class', () => {
    it('should NOT raise member access security error and return with an instance of ClassMember', async () => {
        const container = new Container(containerConfig);
        let error;
        let testClassBInstance;
        try {
            const instance = await container.getReference('testClass');
            testClassBInstance = await instance.testClassPublicProperty;
        } catch (err) {
            error = err;
            console.log(err);
        }
        expect(error).not.toBeDefined();
        expect(testClassBInstance).toBeDefined();
        expect(testClassBInstance.Id.prototype).toEqual(ClassMember);
    });
});