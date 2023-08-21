import { Container } from '../lib/container.mjs';
export class ClassDependency extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${ClassDependency.name} should do`);
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
}
export class SingletonClassDependency extends Container {
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
                                console.log(`construction work that ${SingletonClassDependency.name} should do`);
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
export class ClassDependencyMock extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${ClassDependencyMock.name} should do`);
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
}
export class Class extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        classDependency: {
                            args: {},
                            class: { ClassDependency },
                            mock: { ClassDependencyMock }
                        },
                        singletonClassDependency: {
                            args: {},
                            class: { SingletonClassDependency },
                        },
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${Class.name} should do`);
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
    async getClassDependency() {
        return await this.classDependency;
    }
    async getSingletonClassDependency() {
        return await this.singletonClassDependency;
    }
}