import utils from 'utils';
const privateProperties = new WeakMap();
const getPrivatePropertyValue = function (context, name) {
    const property = privateProperties.get(context);
    if (property) {
        return property[name];
    }
}
const setPrivatePropertyValue = function (context, name, value) {
    const property = privateProperties.get(context);
    if (property) {
        property[name] = value;
    }
}
export class ContainerConfigNode {
    constructor() {
        privateProperties.set(this, {
            Id: null,
            enabled: true,
            key: null,
            type: null,
            children: [],
            value: null,
            index: -1,
            child: null,
            parent: null,
            depth: 0
        });
    }
    remove() {
        let children = getPrivatePropertyValue(this.parent, 'children');
        children = children.filter(x => x.Id !== this.Id);
        setPrivatePropertyValue(this.parent, 'children', children);
        let index = getPrivatePropertyValue(this.parent, 'index');
        index = index - 2;
        setPrivatePropertyValue(this.parent, 'index', index);
        privateProperties.delete(this);
    }
    build(key, value) {
        setPrivatePropertyValue(this, 'key', key);
        setPrivatePropertyValue(this, 'value', value);
        setPrivatePropertyValue(this, 'Id', utils.generateGUID());
        const valueType = (typeof value === 'object' && Array.isArray(value)) ? 'array' : typeof value;
        if (value instanceof ContainerConfigNode) {
            setPrivatePropertyValue(this, 'value', null);
            setPrivatePropertyValue(this, 'type', ContainerConfigNode);
            getPrivatePropertyValue(this, 'children').push(value);
        } else if (valueType === 'array') {
            setPrivatePropertyValue(this, 'type', Array);
            const nodes = value.filter(x => x instanceof ContainerConfigNode);
            if (nodes.length > 0) {
                setPrivatePropertyValue(this, 'value', null);
                for (const node of nodes) {
                    setPrivatePropertyValue(this, 'type', ContainerConfigNode);
                    getPrivatePropertyValue(this, 'children').push(node);
                }
            }
        } else if (valueType === 'object') { //leaf node
            setPrivatePropertyValue(this, 'type', Object);
        } else if (valueType === 'string') { //leaf node
            setPrivatePropertyValue(this, 'type', String);
        } else if (valueType === 'number') { //leaf node
            setPrivatePropertyValue(this, 'type', Number);
        } else if (valueType === 'boolean') { //leaf node
            setPrivatePropertyValue(this, 'type', Boolean);
        } else if (valueType === 'function') { //leaf node
            setPrivatePropertyValue(this, 'type', Function);
        } else {
            throw new Error(`value argument type must be an instance(s) of ${ContainerConfigNode.name}, object or primitive type. i.e. string, number or boolean`);
        }
        for (const child of getPrivatePropertyValue(this, 'children')) {
            setPrivatePropertyValue(child, 'parent', this);
        }
    }
    get Id() {
        return getPrivatePropertyValue(this, 'Id');
    }
    get key() {
        return getPrivatePropertyValue(this, 'key');
    }
    set key(value) {
        setPrivatePropertyValue(this, 'key', value);
    }
    get value() {
        return getPrivatePropertyValue(this, 'value');
    }
    get type() {
        return getPrivatePropertyValue(this, 'type');
    }
    get enabled() {
        return getPrivatePropertyValue(this, 'enabled');
    }
    set enabled(value) {
        setPrivatePropertyValue(this, 'enabled', value);
    }
    get parent() {
        return getPrivatePropertyValue(this, 'parent');
    }
    reset() {
        setPrivatePropertyValue(this, 'index', -1);
    }
    get depth() {
        const parent = getPrivatePropertyValue(this, 'parent');
        const parentDepth = getPrivatePropertyValue(parent, 'depth');
        const currentDepth = parentDepth !== undefined ? parentDepth + 1 : 0;
        setPrivatePropertyValue(this, 'depth', currentDepth);
        return currentDepth;
    }
    get nextChild() {
        const index = getPrivatePropertyValue(this, 'index');
        setPrivatePropertyValue(this, 'index', index + 1);
        return this.currentChild;
    }
    get currentChild() {
        const children = getPrivatePropertyValue(this, 'children');
        const index = getPrivatePropertyValue(this, 'index');
        return children[index];
    }
    get previousChild() {
        const index = getPrivatePropertyValue(this, 'index');
        setPrivatePropertyValue(this, 'index', index - 1);
        return this.currentChild;
    }
    /**
     * @param {Array<String>} keys
     * @param {String} parentKey
     * @param {Function} callback
     */
    find(keys, parentKey, callback, foundNodes) {
        this.reset();
        let isRoot = false;
        if (!foundNodes) {
            foundNodes = [];
            isRoot = true;
        }
        const foundKey = keys.length > 0 ? keys.find(k => k === this.key) : this.key;
        if (foundKey) {
            if (this.parent && this.parent.key === parentKey) {
                foundNodes.push(this);
            }
        }
        while (this.nextChild) {
            this.currentChild.find(keys, parentKey, callback, foundNodes);
        }
        if (isRoot && foundNodes.length > 0) {
            const results = {};
            for (const node of foundNodes) {
                if (node.type === ContainerConfigNode) {
                    results[node.key] = node;
                } else {
                    results[node.key] = node.value;
                }
            }
            callback(results);
        }
    }
    clone(parent) {
        const nodeToClone = this;
        const clonedNode = new ContainerConfigNode();
        setPrivatePropertyValue(clonedNode, 'key', nodeToClone.key);
        setPrivatePropertyValue(clonedNode, 'value', nodeToClone.value);
        setPrivatePropertyValue(clonedNode, 'type', nodeToClone.type);
        setPrivatePropertyValue(clonedNode, 'Id', utils.generateGUID());
        setPrivatePropertyValue(clonedNode, 'parent', parent);
        getPrivatePropertyValue(parent, 'children').push(clonedNode);
        const nodeToCloneChildren = getPrivatePropertyValue(nodeToClone, 'children');
        for (const child of nodeToCloneChildren) {
            child.clone(clonedNode);
        }
    }
    toString() {
        // return;
        this.reset();
        let whiteSpace = ' ';
        for (let i = 0; i < this.depth; i++) {
            whiteSpace = whiteSpace + ' ';
        }
        let value = null;
        let typeName = 'Unknown';
        switch (this.type) {
            case ContainerConfigNode: {
                typeName = ContainerConfigNode.name;
                break;
            }
            case Object: {
                value = JSON.stringify(this.value);
                typeName = Object.name;
                break;
            }
            case String: {
                value = this.value;
                typeName = String.name;
                break;
            }
            case Function: {
                value = this.value.name;
                typeName = Function.name;
                break;
            }
            default: {
                break;
            }
        }
        console.log(`${whiteSpace}${JSON.stringify({ name: this.key, type: typeName })}`);
        while (this.nextChild) {
            this.currentChild.toString();
        }
    }
}