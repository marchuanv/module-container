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
export class TreeNodeTemplate {
    constructor(name, value) {
        const valueType = typeof value;
        const properties = {
            Id: null,
            name,
            type: null,
            children: null,
            value: null,
            childIndex: 0,
            parentIndex: 0,
            chid: null,
            parent: null,
            depth: 0
        };
        properties.Id = utils.generateGUID();
        properties.children = [];
        let type = '';
        let _value = null;
        if (value instanceof TreeNodeTemplate) {
            type = TreeNodeTemplate;
            properties.children.push(value);
        } else if (Array.isArray(value)) {
            for (const item of value) {
                if (item instanceof TreeNodeTemplate) {
                    type = TreeNodeTemplate;
                    properties.children.push(item);
                } else {
                    throw new Error(`value argument type must be an instance(s) of ${TreeNodeTemplate.name} or primitive type. i.e. string, number or boolean`);
                }
            }
        } else if (valueType === 'object') { //leaf node
            type = Object;
        } else if (valueType === 'string') { //leaf node
            type = String;
            _value = value;
        } else if (valueType === 'number') { //leaf node
            type = Number;
            _value = value;
        } else if (valueType === 'boolean') { //leaf node
            type = Boolean;
            _value = value;
        } else {
            throw new Error(`value argument type must be an instance(s) of ${TreeNodeTemplate.name}, object or primitive type. i.e. string, number or boolean`);
        }
        for (const child of properties.children) {
            setPrivatePropertyValue.call(child, 'parent', this);
        }
        properties.type = type;
        properties.value = _value;
        privateProperties.set(this, properties);
    }
    get Id() {
        return getPrivatePropertyValue.call(this, 'Id');
    }
    get name() {
        return getPrivatePropertyValue.call(this, 'name');
    }
    get type() {
        return getPrivatePropertyValue.call(this, 'type');
    }
    get value() {
        return getPrivatePropertyValue.call(this, 'value');
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
        return `${whiteSpace} -> name: ${this.name}, value: ${this.value ? this.value : 'None'}, type: ${this.type.name ? this.type.name : this.type}`;
    }
}
export class TreeNode {
    constructor(object, treeNodeTemplate) {
        const keys = Object.entries(object);

        const properties = {
            Id: null,
            key,
            value,
            parent: null,
            children: [],
            nextIndex: -1,
            templateKey: template.key,
            templateValue: template.value
        };
        properties.Id = utils.generateGUID();
        properties.children = [];
        privateProperties.set(this, properties);
    }
    matchTemplate() {
        const templateKey = getPrivatePropertyValue.call(this, 'templateKey');
        const templateValue = getPrivatePropertyValue.call(this, 'templateValue');
        let isValid = false;
        if (templateKey === 'any') {
            if (this.key) {
                isValid = true;
            }
        } else {
            if (this.key === templateKey) {
                isValid = true;
            }
        }
        if (templateValue === 'any') {
            isValid = false;
            if (this.value) {
                isValid = true;
            }
        } else {
            isValid = false;
            if (this.value === templateValue) {
                isValid = true;
            }
        }
        return isValid;
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
    get parent() {
        return getPrivatePropertyValue.call(this, 'parent');
    }
    get child() {
        const children = getPrivatePropertyValue.call(this, 'children');
        const nextIndex = getPrivatePropertyValue.call(this, 'nextIndex');
        if (nextIndex >= children.length) {
            nextIndex = -1;
        }
        nextIndex = nextIndex + 1;
        return children[nextIndex];
    }
    set child(value) {
        getPrivatePropertyValue.call(this, 'children').push(value);
    }
}