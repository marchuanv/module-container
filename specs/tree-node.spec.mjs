import { TreeNode, TreeNodeTemplate } from '../lib/container/tree-node.mjs';
fdescribe('when creating a', () => {
    it('should', async () => {
        const config = {
            members: {},
            behavior: {},
            mocks: {}
        }
        const containerConfig = new TreeNodeTemplate('container', [
            new TreeNodeTemplate('members', [
                new TreeNodeTemplate('any', [
                    new TreeNodeTemplate('class', {}),
                    new TreeNodeTemplate('args', {})
                ]),
                new TreeNodeTemplate('any', [
                    new TreeNodeTemplate('value', {})
                ]),
                new TreeNodeTemplate('any', [
                    new TreeNodeTemplate('callback', {}),
                    new TreeNodeTemplate('args', {})
                ])
            ]),
            new TreeNodeTemplate('behavior', [
                new TreeNodeTemplate('singleton', false),
                new TreeNodeTemplate('errorHalt', true)
            ]),
            new TreeNodeTemplate('mocks', [
                new TreeNodeTemplate('any', [
                    new TreeNodeTemplate('class', {}),
                    new TreeNodeTemplate('classMock', {}),
                    new TreeNodeTemplate('args', {})
                ])
            ])
        ]);

        let child = containerConfig.child;
        do {
            expect(child).toBeDefined();
            console.log();
            console.log(`name: ${child.name}, value: ${child.value}`);
            child = child.child;
        } while (child)

        // const node = new TreeNode(config, containerConfig);
        // if (node.matchTemplate()) {
        //     console.log('matches template');
        // } else {
        //     console.log('does not match template');
        // }
    });
});