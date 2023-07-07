import {
    Container,
} from '../../lib/registry.mjs';

class ContainerTestDependency {
    constructor({ someArg }) {
        this.someArg = someArg;
    }
    async doSomething() {
        console.log(this.someArg);
    }
}

class ContainerTest extends Container {
    constructor() {
        super();
        this.finished = false;
        this.dependency({
            containerTestDependency: {
                ContainerTestDependency,
                ctorArgs: {
                    someArg: 'Hello World'
                }
            }
        });
        this.dependency(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('create delay');
                    this.finished = true;
                    resolve();
                }, 1000);
            });
        });
    }
    async doSomething() {
        console.log(this.someArg);
        await this.containerTestDependency.doSomething();
    }
}

fdescribe('when-regestering-classes', () => {
    let error;
    let finished = false;
    beforeAll(async () => {
        try {
            const containerTest = new ContainerTest();
            finished = containerTest.finished;
            await containerTest.doSomething();
        } catch (err) {
            error = err;
        }
    });
    it('should not get an error', () => {
        expect(error).not.toBeDefined();
    });
    it('should wait for constructor async operations to finish', () => {
        expect(finished).toBeTrue();
    });
});