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
class Node {
    build(key, value) {
        privateProperties.set(this, { Id: null, key, type: null, children: [], value, childIndex: 0, child: null, parent: null, depth: 0 });
        setPrivatePropertyValue(this, 'Id', utils.generateGUID());
        const valueType = typeof value;
        if (value instanceof Node) {
            setPrivatePropertyValue(this, 'type', Node);
            getPrivatePropertyValue(this, 'children').push(value);
        } else if (Array.isArray(value)) {
            setPrivatePropertyValue(this, 'type', Array);
            for (const item of value) {
                if (item instanceof Node) {
                    setPrivatePropertyValue(this, 'type', Node);
                    getPrivatePropertyValue(this, 'children').push(item);
                } else {
                    throw new Error(`value argument type must be an instance(s) of ${Node.name} or primitive type. i.e. string, number or boolean`);
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
            throw new Error(`value argument type must be an instance(s) of ${Node.name}, object or primitive type. i.e. string, number or boolean`);
        }
        setPrivatePropertyValue(this, 'value', value);
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
    get value() {
        return getPrivatePropertyValue(this, 'value');
    }
    get type() {
        return getPrivatePropertyValue(this, 'type');
    }
    get parent() {
        return getPrivatePropertyValue(this, 'parent');
    }
    get depth() {
        const currentDepth = getPrivatePropertyValue(this, 'depth');
        for (const child of getPrivatePropertyValue(this, 'children')) {
            child.depth = currentDepth + 1;
        }
        return currentDepth;
    }
    set depth(value) {
        setPrivatePropertyValue(this, 'depth', value);
    }
    get child() {
        const children = getPrivatePropertyValue(this, 'children');
        let childIndex = getPrivatePropertyValue(this, 'childIndex');
        let _parent = getPrivatePropertyValue(this, 'parent');
        let _child = children[childIndex];
        if (_child) {
            childIndex = childIndex + 1;
            setPrivatePropertyValue(this, 'childIndex', childIndex);
            return _child;
        } else if (_parent) {
            return _parent.child;
        }
    }
    toString() {
        setPrivatePropertyValue(this, 'childIndex', 0);
        let whiteSpace = ' ';
        for (let i = 0; i < this.depth; i++) {
            whiteSpace = whiteSpace + ' ';
        }
        const typeName = this.type.name ? this.type.name : this.type;
        const value = this.type.name === 'String' ? this.value : 'none';
        console.log(`${whiteSpace}${this.depth} -> key: ${this.key}, type: ${typeName}, value: ${value}`);
        let _child = this.child;
        while (_child) {
            _child.toString();
            _child = this.child;
        }
    }
}

export class ContainerConfigTemplate extends Node {
    constructor(key, value) {
        super();
        this.build(key, value);
    }
}

export class ContainerConfig extends Node {
    /**
     * 
     * @param {ContainerConfigTemplate} containerConfigTemplate
     * @param {Object} config
     * @returns 
    */
    constructor(containerConfigTemplate, config) {
        super();
        if (!privateProperties.has(config)) {
            const key = 'container';
            const value = config[key];
            if (!key || !value) {
                throw new Error('config does not have a root property');
            }
            privateProperties.set(config, { key, value });
        }
        let key = getPrivatePropertyValue(config, 'key');
        let value = getPrivatePropertyValue(config, 'value');
        let templateMatched = false;
        let templateNode = containerConfigTemplate.child;
        while (templateNode) {
            if (templateNode.key === key || templateNode.key === 'any') {
                templateMatched = true;
                break;
            }
            templateNode = containerConfigTemplate.child;
        }
        if (!templateMatched) {
            return;
        }
        const isNullOrUndefined = value === undefined || value === null;
        if (!isNullOrUndefined && typeof value === 'object' && !utils.isEmptyObject(value)) {
            const keys = Object.keys(value);
            if (keys.length > 0) {
                const configurations = [];
                for (const _key of keys) {
                    const _value = value[_key];
                    setPrivatePropertyValue(config, 'key', _key);
                    setPrivatePropertyValue(config, 'value', _value);
                    configurations.push(new ContainerConfig(containerConfigTemplate, config));
                }
                this.build(key, value);
            }
        } else if (!isNullOrUndefined) {
            this.build(key, value);
        } else {
            console.log(`error in building configuration tree`);
        }
    }
    match(containerConfigTemplate) {
        // setPrivatePropertyValue.call(containerConfigTemplate, 'childIndex', 0);
        // setPrivatePropertyValue.call(this, 'childIndex', 0);
        // let child1 = this.child;
        // let child2 = containerConfigTemplate.child;
        // while (child1 && child2) {
        //     if (child1.depth === child2.depth && (child1.key === child2.key || child2.key === 'any')) {
        //         console.log(`SUCCESS: [template key: ${child2.key}] === [config key: ${child1.key}]`);
        //         child2 = child2.child;
        //         child1 = child1.child;
        //     } else if (child1.depth === child2.depth) {
        //         throw `FAIL: ${child2.key} depth is not the same as ${child1.key}`);
        //         child1 = child1.child;
        //     } else {
        //         child1 = child1.child;
        //     }
        // }
        // return false;
    }
}