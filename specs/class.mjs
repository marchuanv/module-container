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
    async publicMethod() {
        return this;
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
                        singleton: true,
                        errorHalt: true
                    }
                }
            }
        });
    }
    async publicMethod() {
        return this;
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
    async publicMethod() {
        const classDependency = await this.classDependency;
        return await classDependency.publicMethod();
    }
}

export class SingletonClass extends Container {
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
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${SingletonClass.name} should do`);
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
    async publicMethod() {
        const classDependency = await this.classDependency;
        return await classDependency.publicMethod();
    }
}