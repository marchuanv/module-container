import { Container } from '../lib/container.mjs';
export class TestClassDependency extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        property: {
                            value: {
                                value: "default"
                            }
                        },
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${TestClassDependency.name} should do`);
                            }
                        },
                    },
                    behaviour: {
                        singleton: false,
                        errorHalt: true
                    }
                }
            }
        });
    }
    async getProperty() {
        const property = await this.property;
        return property.value;
    }
    async setProperty(value) {
        const property = await this.property;
        property.value = value;
    }
}
export class TestClasSingletonDependency extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        property: {
                            value: {
                                value: "default"
                            }
                        },
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${TestClasSingletonDependency.name} should do`);
                            }
                        },
                    },
                    behaviour: {
                        singleton: true,
                        errorHalt: true
                    }
                }
            }
        });
    }
    async getProperty() {
        const property = await this.property;
        return property.value;
    }
    async setProperty(value) {
        const property = await this.property;
        property.value = value;
    }
}
export class TestClassMockDependency extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        property: {
                            value: {
                                value: "default"
                            }
                        },
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${TestClassMockDependency.name} should do`);
                            }
                        },
                    },
                    behaviour: {
                        singleton: false,
                        errorHalt: true
                    }
                }
            }
        });
    }
    async getProperty() {
        const property = await this.property;
        return property.value;
    }
    async setProperty(value) {
        const property = await this.property;
        property.value = value;
    }
}
export class MockTestClass extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        testClassMockDependency: {
                            args: {},
                            class: { TestClassDependency },
                            mock: { TestClassMockDependency }
                        },
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${MockTestClass.name} should do`);
                            }
                        },
                    },
                    behaviour: {
                        singleton: false,
                        errorHalt: true
                    }
                }
            }
        });
    }
    async getTestClassMockDependency() {
        return await this.testClassMockDependency;
    }
}
export class TestClass extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        testClassDependency: {
                            args: {},
                            class: { TestClassDependency },
                        },
                        testClasSingletonDependency: {
                            args: {},
                            class: { TestClasSingletonDependency },
                        },
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${TestClass.name} should do`);
                            }
                        },
                    },
                    behaviour: {
                        singleton: false,
                        errorHalt: true
                    }
                }
            }
        });
    }
    async getTestClassDependency() {
        return await this.testClassDependency;
    }
    async getTestClasSingletonDependency() {
        return await this.testClasSingletonDependency;
    }
}