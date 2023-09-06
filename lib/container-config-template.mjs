import { ContainerConfigNode } from "./container-config-node.mjs";
export class ContainerConfigTemplate extends ContainerConfigNode {
    constructor() {
        super();

        const refProperty2 = new ContainerConfigNode();
        const _classRef2 = new ContainerConfigNode();
        _classRef2.build('class', {});
        const args3 = new ContainerConfigNode();
        args3.build('args', {});
        const isPublic2 = new ContainerConfigNode();
        isPublic2.build('isPublic', false);
        refProperty2.build('any', [_classRef2, args3, isPublic2]);

        const refProperties = new ContainerConfigNode();
        refProperties.build('referenceProperties', [refProperty2]);

        const staticProperty = new ContainerConfigNode();
        const value = new ContainerConfigNode();
        value.build('value', {});
        const isPublic3 = new ContainerConfigNode();
        isPublic3.build('isPublic', false);
        staticProperty.build('any', value);

        const staticProperties = new ContainerConfigNode();
        staticProperties.build('staticProperties', [staticProperty]);

        const method1 = new ContainerConfigNode();
        const args2 = new ContainerConfigNode();
        args2.build('args', {});
        const callback = new ContainerConfigNode();
        callback.build('callback', {});
        const isPublic4 = new ContainerConfigNode();
        isPublic4.build('isPublic', false);
        method1.build('any', [callback, args2, isPublic4]);

        const methods = new ContainerConfigNode();
        methods.build('methods', [method1]);

        const isPublic5 = new ContainerConfigNode();
        isPublic5.build('isPublic', false);

        const args4 = new ContainerConfigNode();
        args4.build('args', {});

        const ctor = new ContainerConfigNode();
        ctor.build('ctor', {});

        const classMock = new ContainerConfigNode();
        classMock.build('classMock', {});

        const errorHalt = new ContainerConfigNode();
        errorHalt.build('isHaltOnErrors', true);

        const isInterface = new ContainerConfigNode();
        isInterface.build('isInterface', false);

        const isSingleton = new ContainerConfigNode();
        isSingleton.build('isSingleton', false);

        const _classAny1 = new ContainerConfigNode();
        _classAny1.build('any', [args4, ctor, classMock, errorHalt, isInterface, isSingleton, isPublic5, refProperties, staticProperties, methods]);

        const container = new ContainerConfigNode();
        this.build('container', [_classAny1]);
    }
}