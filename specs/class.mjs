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
                                console.log(`construction work that ${ClassDependency} should do`);
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
export class ClassDependencyMock extends Container {
    constructor() {
        super({
            root: {
                container: {
                    members: {
                        setup: {
                            args: {},
                            callback: async () => {
                                console.log(`construction work that ${ClassDependencyMock} should do`);
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
                                console.log(`construction work that ${Class} should do`);
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
        return classDependency;
    }
}