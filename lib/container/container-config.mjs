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
    constructor() {
        privateProperties.set(this, {
            Id: null,
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
    build(key, value) {
        setPrivatePropertyValue(this, 'key', key);
        setPrivatePropertyValue(this, 'value', value);
        setPrivatePropertyValue(this, 'Id', utils.generateGUID());
        const valueType = typeof value;
        if (value instanceof Node) {
            setPrivatePropertyValue(this, 'value', null);
            setPrivatePropertyValue(this, 'type', Node);
            getPrivatePropertyValue(this, 'children').push(value);
        } else if (Array.isArray(value)) {
            setPrivatePropertyValue(this, 'type', Array);
            setPrivatePropertyValue(this, 'value', null);
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
    toString() {
        let whiteSpace = ' ';
        for (let i = 0; i < this.depth; i++) {
            whiteSpace = whiteSpace + ' ';
        }
        const typeName = this.type.name ? this.type.name : this.type;
        const value = this.type.name === 'String' ? this.value : 'none';
        console.log(`${whiteSpace}${this.depth} -> key: ${this.key}, type: ${typeName}, value: ${value}`);
        while (this.nextChild) {
            this.currentChild.toString();
        }
        while (this.previousChild);
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
    constructor(template, config) {
        super();
        let templateKey = template.key;
        let templateValue = template.value;
        switch (template.type) {
            case Object: {
                this.build(templateKey, config);
                return;
            }
            case String: {
                this.build(templateKey, config);
                return;
            }
            case Number: {
                this.build(templateKey, config);
                return;
            }
            case Boolean: {
                this.build(templateKey, config);
                return;
            }
            case Function: {
                this.build(templateKey, config);
                return;
            }
            default: {
                break;
            }
        }
        const configDictionary = Object.keys(config).map(key => {
            const value = config[key];
            const type = typeof value;
            return { key, value, type, isAnyKey: templateKey === 'any' };
        });
        for (const configDictionaryItem of configDictionary.filter(x => x.type === 'object' && x.isAnyKey)) {
            const { key, value } = configDictionaryItem;
            let valueStructureMatchTemplate = true;
            while (template.nextChild) {
                if (!valueStructureMatchTemplate) {
                    break;
                }
                const childTemplate = template.currentChild;
                valueStructureMatchTemplate = value[childTemplate.key] !== undefined;
            }
            while (template.previousChild); //reset
            if (valueStructureMatchTemplate) {
                templateKey = key;
                configDictionaryItem.isAnyKey = false;
                break;
            }
        }
        templateValue = [];
        config = config[templateKey];
        if (config) {
            while (template.nextChild) {
                const containerConfig = new ContainerConfig(template.currentChild, config);
                if (containerConfig.key) {
                    templateValue.push(containerConfig);
                }
            }
            while (template.previousChild); //reset
            this.build(templateKey, templateValue);
        } else {
            console.log(`key ${templateKey} found for config`);
        }

    }
}