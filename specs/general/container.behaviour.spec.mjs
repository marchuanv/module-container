import {
    Container,
} from '../../lib/registry.mjs';
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
                ContainerTestDependency,
                ctorArgs: {
                    someArg: 'Hello World'
                }
            },
            finished: false,
            someFunc: () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        console.log('create delay');
                        this.finished = true;
                        resolve();
                    }, 1000);
                });
            }
        });
    }
    async doSomething() {
        await this.containerTestDependency.doSomething();
    }
}
describe('when-regestering-classes', () => {
    let finished = false;
    beforeAll(async () => {
        const containerTest = new ContainerTest();
        await containerTest.doSomething();
        finished = containerTest.finished;
    });
    it('should wait for constructor async operations to finish', () => {
        expect(finished).toBeTrue();
    });
});