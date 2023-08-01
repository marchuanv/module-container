import utils from 'utils';
const privateProperties = new Map();
const getPrivatePropertyValue = function (name) {
    const property = privateProperties.get(this);
    return property[name];
}
const setPrivatePropertyValue = function (name, value) {
    const property = privateProperties.get(this);
    property[name] = value;
}
class Node {
    constructor(key, value) {
        privateProperties.set(this, {
            Id: null,
            key,
            type: null,
            children: [],
            value,
            childIndex: 0,
            child: null,
            parent: null,
            depth: 0
        });
        setPrivatePropertyValue.call(this, 'Id', utils.generateGUID());
        const valueType = typeof value;
        if (value instanceof Node) {
            setPrivatePropertyValue.call(this, 'type', Node);
            getPrivatePropertyValue.call(this, 'children').push(value);
        } else if (Array.isArray(value)) {
            setPrivatePropertyValue.call(this, 'type', Array);
            for (const item of value) {
                if (item instanceof Node) {
                    setPrivatePropertyValue.call(this, 'type', Node);
                    getPrivatePropertyValue.call(this, 'children').push(item);
                } else {
                    throw new Error(`value argument type must be an instance(s) of ${Node.name} or primitive type. i.e. string, number or boolean`);
                }
            }
        } else if (valueType === 'object') { //leaf node
            setPrivatePropertyValue.call(this, 'type', Object);
        } else if (valueType === 'string') { //leaf node
            setPrivatePropertyValue.call(this, 'type', String);
        } else if (valueType === 'number') { //leaf node
            setPrivatePropertyValue.call(this, 'type', Number);
        } else if (valueType === 'boolean') { //leaf node
            setPrivatePropertyValue.call(this, 'type', Boolean);
        } else if (valueType === 'function') { //leaf node
            setPrivatePropertyValue.call(this, 'type', Function);
        } else {
            throw new Error(`value argument type must be an instance(s) of ${Node.name}, object or primitive type. i.e. string, number or boolean`);
        }
        setPrivatePropertyValue.call(this, 'value', value);
        for (const child of getPrivatePropertyValue.call(this, 'children')) {
            setPrivatePropertyValue.call(child, 'parent', this);
        }
    }
    get Id() {
        return getPrivatePropertyValue.call(this, 'Id');
    }
    get key() {
        return getPrivatePropertyValue.call(this, 'key');
    }
    get value() {
        return getPrivatePropertyValue.call(this, 'value');
    }
    get type() {
        return getPrivatePropertyValue.call(this, 'type');
    }
    get parent() {
        return getPrivatePropertyValue.call(this, 'parent');
    }
    get depth() {
        const currentDepth = getPrivatePropertyValue.call(this, 'depth');
        for (const child of getPrivatePropertyValue.call(this, 'children')) {
            child.depth = currentDepth + 1;
        }
        return currentDepth;
    }
    set depth(value) {
        setPrivatePropertyValue.call(this, 'depth', value);
    }
    get child() {
        const children = getPrivatePropertyValue.call(this, 'children');
        let childIndex = getPrivatePropertyValue.call(this, 'childIndex');
        let _parent = getPrivatePropertyValue.call(this, 'parent');
        let _child = children[childIndex];
        if (_child) {
            childIndex = childIndex + 1;
            setPrivatePropertyValue.call(this, 'childIndex', childIndex);
            return _child;
        } else if (_parent) {
            return _parent.child;
        }
    }
    toString() {
        let whiteSpace = ' ';
        for (let i = 0; i < this.depth; i++) {
            whiteSpace = whiteSpace + ' ';
        }
        const typeName = this.type.name ? this.type.name : this.type;
        const value = this.type.name === 'String' ? this.value : 'none';
        console.log(`${whiteSpace}${this.depth} -> key: ${this.key}, type: ${typeName}, value: ${value}`);
        let _child = this.child;
        while (_child) {
            console.log(_child.toString());
            _child = this.child;
        }
        setPrivatePropertyValue.call(this, 'childIndex', 0);
    }
}

export class ContainerConfigTemplate extends Node {
    constructor(key, value) {
        super(key, value);
    }
}

export class ContainerConfig extends Node {
    constructor(key, value) {
        try {
            value = JSON.parse(JSON.stringify(value));
            const isNullOrUndefined = value === undefined || value === null;
            if (!isNullOrUndefined && typeof value === 'object') {
                const configurations = [];
                for (const _key of Object.keys(value)) {
                    const _value = value[_key];
                    configurations.push(new ContainerConfig(_key, _value));
                }
                super(key, configurations);
            } else if (!isNullOrUndefined) {
                super(key, value);
            } else {
                throw new Error(`error in building configuration tree`);
            }
        } catch (error) {
            debugger;
        }

    }
}