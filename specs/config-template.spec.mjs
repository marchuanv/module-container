import vm from 'node:vm'
class SomeClass { }
class ContainerConfigTemplate {
    constructor({ config }) {
        this.config = config;
        this.template = {
            members: {
                any_1: {
                    class: Object,
                    args: Object
                },
                any_2: {
                    callback: Function,
                    args: Object
                },
                any_3: { value: Object }
            },
            behaviour: {
                singleton: Boolean,
                errorHalt: Boolean
            }, mocks: {
                any: {
                    class: Object,
                    mockClass: Object,
                    args: Object
                }
            }
        };
        this.messages = [];
    }
    validate(configItem = this.config, templateItem = this.template) {
        const configItemType = typeof configItem;
        const templateItemType = typeof templateItem;
        if (configItemType === templateItemType && templateItemType === 'object') {
            for (const configKey of Object.keys(configItem)) {
                const configValue = configItem[configKey];
                for (const templateKey of Object.keys(templateItem)) {
                    const templateValue = templateItem[templateKey];
                    if (this.validate(configValue, templateValue)) {

                    } else {
                        this.messages.push(`config[${templateKey}] argument passed to ${this.contextName} constructor is null or undefined.`);
                    }
                }
            }
            if (this.messages.length === 0) {
                this.messages.push(`config[${key}] argument passed to ${this.contextName} class constructor is null or undefined.`);
            }
        } else {
            for (const configKey of Object.keys(configItem)) {
                const configValue = configItem[configKey];
                const unmatchedTemplateKeys = [];
                for (const templateKey of Object.keys(templateItem)) {
                    const templateValue = templateItem[templateKey];
                    if (Object.keys(configValue) && Object.keys(templateValue)) {

                    }


                    this.messages.push(`config[${key}] argument passed to ${this.contextName} class constructor is null or undefined.`);
                }
                if (configValue === undefined || configValue === null) {
                    this.messages.push(`config[${key}] argument passed to ${this.contextName} class constructor is null or undefined.`);
                }
            }
        }
        return this.messages === 0;
    }
}

fdescribe('when providing container config the config template matcher', () => {
    it('should valid the config and make sure that it matches the template', async () => {
        const config = {
            members: {
                path: { value: "some path" },
                content: { value: 'class HelloWord { sayHello() { console.log("Hello"); } }' },
                someClass: { class: { SomeClass }, args: {} },
                filePath: { value: "c:/test/test/test" },
                vm: { value: vm }
            },
            behaviour: {
                singleton: false,
                errorHalt: true
            },
            mocks: {}
        };
        const containerConfigTempalte = new ContainerConfigTemplate({ config });
        containerConfigTempalte.validate();
    });
});