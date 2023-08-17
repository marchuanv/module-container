import { ContainerConfigNode } from "./container-config-node.mjs";
export class ContainerConfigTemplate extends ContainerConfigNode {
    constructor() {
        super();


        const any1 = new ContainerConfigNode();
        const _class = new ContainerConfigNode();
        _class.build('class', {});
        const args = new ContainerConfigNode();
        args.build('args', {});
        any1.build('any', [_class, args]);

        const any2 = new ContainerConfigNode();
        const value = new ContainerConfigNode();
        value.build('value', {});
        any2.build('any', value);

        const any3 = new ContainerConfigNode();
        const callback = new ContainerConfigNode();
        callback.build('callback', {});
        const args2 = new ContainerConfigNode();
        args2.build('args', {});
        any3.build('any', [callback, args2]);

        const members = new ContainerConfigNode();
        members.build('members', [any1, any2, any3]);

        const singleton = new ContainerConfigNode();
        singleton.build('singleton', false);
        const errorHalt = new ContainerConfigNode();
        errorHalt.build('errorHalt', true);
        const behaviour = new ContainerConfigNode();
        behaviour.build('behaviour', [singleton, errorHalt]);

        const any = new ContainerConfigNode();
        const _class2 = new ContainerConfigNode();
        _class2.build('class', {});
        const mockClass = new ContainerConfigNode();
        mockClass.build('mockClass', {});
        const args4 = new ContainerConfigNode();
        args4.build('args', {});
        any.build('any', [_class2, mockClass, args4]);
        const mocks = new ContainerConfigNode();
        mocks.build('mocks', any);

        const container = new ContainerConfigNode();
        container.build('container', [members, behaviour, mocks]);
        this.build('root', [container]);
    }
}