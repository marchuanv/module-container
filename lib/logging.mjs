import { Container } from "./registry.mjs";
export class Logging extends Container {
    constructor({ logLevel }) {
        super({ logLevel: { name: 'logLevel', value: logLevel } });
    }
    async log({ error, message }) {
        if (error) {
            if (!(error instanceof Error)) {
                throw new Error('error argument is not of type: Error');
            }
        } else {
            if (message) {
                error = new Error(message);
            } else {
                throw new Error('error or message argument was not passed');
            }
        }
        if (this.logLevel === 'info') {
            console.log(error.message);
            console.log(error.stack);
        } else {
            throw (error);
        }
    }
}
