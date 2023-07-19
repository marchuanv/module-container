import { Container } from '../../lib/registry.mjs';
class ContainerTestDependency {
    constructor({ someArg }) {
        this.someArg = someArg;
    }
    doSomething() {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(this.someArg);
                resolve();
            }, 500);
        });
    }
}
class ContainerTest extends Container {
    constructor() {
        super({
            containerTestDependency: {
                type: { ContainerTestDependency },
                args: {
                    someArg: 'Hello World'
                }
            },
            finished: {
                name: 'finished',
                value: false
            },
            someFunc: {
                callback: {
                    func: () => {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                console.log('create delay');
                                this.finished = true;
                                resolve();
                            }, 1000);
                        });
                    }
                },
                args: {}
            }
        });
    }
    async doSomething() {
        const containerTestDependency = await this.containerTestDependency;
        await containerTestDependency.doSomething();
    }
}
describe('when-regestering-classes', () => {
    let finished = false;
    beforeAll(async () => {
        const containerTest = new ContainerTest();
        await containerTest.doSomething();
        finished = await containerTest.finished;
    });
    it('should wait for constructor async operations to finish', () => {
        expect(finished).toBeTrue();
    });
});