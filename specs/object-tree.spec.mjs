import { TreeNode } from '../lib/container/tree-node.mjs';
class TestObject {}
fdescribe('when creating a', () => {
    it('should', async () => {
        const object = new TestObject();
        const node = new TreeNode({ key: 'keyA', value: object });
        if (node.matchTemplate()) {
            console.log('matches template');
        } else {
            console.log('does not match template');
        }
    });
});