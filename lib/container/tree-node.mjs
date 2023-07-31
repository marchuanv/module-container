import utils from 'utils';
const nodePrivateProperties = new Map();
const getPrivatePropertyValue = function(name) {
    const property = nodePrivateProperties.get(this);
    return property[name];
}
export class TreeNode {
    constructor(object, template = { key: 'any', value: 'any' }) {
        const key = Object.keys(object);
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
        nodePrivateProperties.set(this, properties);
    }
    matchTemplate() {
        const templateKey = getPrivatePropertyValue.call(this, 'templateKey');
        const templateValue = getPrivatePropertyValue.call(this,'templateValue');
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
        return getPrivatePropertyValue.call(this,'Id');
    }
    get key() {
        return getPrivatePropertyValue.call(this,'key');
    }
    get value() {
        return getPrivatePropertyValue.call(this,'value');
    }
    get parent() {
        return getPrivatePropertyValue.call(this,'parent');
    }
    get child() {
        const children =  getPrivatePropertyValue.call(this,'children');
        const nextIndex =  getPrivatePropertyValue.call(this,'nextIndex');
        if (nextIndex >= children.length) {
            nextIndex = -1;
        }
        nextIndex = nextIndex + 1;
        return children[nextIndex];
    }
    set child(value) {
        getPrivatePropertyValue.call(this,'children').push(value);
    }
}