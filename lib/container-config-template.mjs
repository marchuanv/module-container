import { ContainerConfigNode } from "./container-config-node.mjs";
export class ContainerConfigTemplate extends ContainerConfigNode {
    constructor() {
        super();

        const any1 = new ContainerConfigNode();
        const _class = new ContainerConfigNode();
        _class.build('class', {});
        const args = new ContainerConfigNode();
        args.build('args', {});
        const mock = new ContainerConfigNode();
        mock.build('mock', {});
        any1.build('any', [_class, args, mock]);

        const any2 = new ContainerConfigNode();
        const _class2 = new ContainerConfigNode();
        _class2.build('class', {});
        const args3 = new ContainerConfigNode();
        args3.build('args', {});

        any2.build('any', [_class2, args3]);

        const any3 = new ContainerConfigNode();
        const value = new ContainerConfigNode();
        value.build('value', {});
        any3.build('any', value);

        const any4 = new ContainerConfigNode();
        const callback = new ContainerConfigNode();
        callback.build('callback', {});
        const args2 = new ContainerConfigNode();
        args2.build('args', {});
        any4.build('any', [callback, args2]);

        const members = new ContainerConfigNode();
        members.build('members', [any1, any2, any3, any4]);

        const singleton = new ContainerConfigNode();
        singleton.build('singleton', false);
        const errorHalt = new ContainerConfigNode();
        errorHalt.build('errorHalt', true);
        const behaviour = new ContainerConfigNode();
        behaviour.build('behaviour', [singleton, errorHalt]);

        const container = new ContainerConfigNode();
        container.build('container', [members, behaviour]);
        this.build('root', [container]);
    }
}