import { ContainerConfigNode } from "./container-config-node.mjs";
export class ContainerConfig extends ContainerConfigNode {
    /**
     * 
     * @param {ContainerConfigNode} containerConfigTemplate
     * @param {Object} config
     * @returns 
    */
    constructor(template, config) {
        try {
            super();
            let templateKey = template.key;
            if (template.type !== ContainerConfigNode) {
                if (config[templateKey] !== undefined) {
                    return this.build(templateKey, config[templateKey]);
                } else {
                    throw new Error(`${templateKey} does not exist in the container configuration`);
                }
            }
            const configDictionary = Object.keys(config).map(key => {
                const value = config[key];
                const type = typeof value;
                return { key, value, type, isAnyKey: templateKey === 'any' };
            });
            let removeConfig = false;
            for (const configDictionaryItem of configDictionary.filter(x => x.type === 'object' && x.isAnyKey)) {
                let valueStructureMatchTemplate = true;
                template.reset();
                while (template.nextChild) {
                    if (!valueStructureMatchTemplate) {
                        break;
                    }
                    const childTemplateKey = template.currentChild.key;
                    valueStructureMatchTemplate = configDictionaryItem.value[childTemplateKey] !== undefined;
                }
                if (valueStructureMatchTemplate) {
                    template.clone(template.parent);
                    templateKey = configDictionaryItem.key;
                    removeConfig = true;
                    break;
                }
            }
            const configurations = [];
            const _config = config[templateKey];
            if (removeConfig) {
                delete config[templateKey];
            }
            if (_config) {
                template.reset();
                while (template.nextChild) {
                    const containerConfig = new ContainerConfig(template.currentChild, _config);
                    if (containerConfig.key) {
                        configurations.push(containerConfig);
                    }
                }
                this.build(templateKey, configurations);
            }
        } catch (error) {
            throw error;
        }
    }
}