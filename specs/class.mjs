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
                        testClassDependencySetup: {
                            args: {},
                            callback: async () => {
                                this.log(`post constructor member called`);
                            }
                        }
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
export class TestClassDependency2 extends Container {
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
                        testClassDependency2Setup: {
                            args: {},
                            callback: async () => {
                                this.log(`post constructor member called`);
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
                        testClasSingletonDependencySetup: {
                            args: {},
                            callback: async () => {
                                this.log(`post constructor member called`);
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
                        testClassMockDependencySetup: {
                            args: {},
                            callback: async () => {
                                this.log(`post constructor member called`);
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
                        mockTestClassSetup: {
                            args: {},
                            callback: async () => {
                                this.log(`post constructor member called`);
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
                        testClassSetup: {
                            args: {},
                            callback: async () => {
                                this.log(`post constructor member called`);
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
}
export class TestClassSingletons extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        testClasSingletonDependency: {
                            args: {},
                            class: { TestClasSingletonDependency },
                        },
                        testClassSingletonsSetup: {
                            args: {},
                            callback: async () => {
                                this.log(`post constructor member called`);
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
    async getTestClasSingletonDependency() {
        return await this.testClasSingletonDependency;
    }
}
export class TestClassMultipleInstancesForOneDependency extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        testClassDependency: {
                            args: {},
                            class: { TestClassDependency, TestClassDependency2 },
                        },
                        testClasSingletonDependency: {
                            args: {},
                            class: { TestClasSingletonDependency },
                        },
                        testClassMultipleInstancesForOneDependencySetup: {
                            args: {},
                            callback: async () => {
                                this.log(`post constructor member called`);
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
}