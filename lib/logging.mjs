export class Logging {
    globalLevel = 'unknown';
    setToInfo() {
        this.globalLevel = "info";
    }
    setToError() {
        this.globalLevel = "error";
    }
    log({ error }) {
        if (!error || (error && !(error instanceof Error))) {
            throw new Error('error argument passed to Logging.log({ error }) is not of type: Error, or is null or undefined');
        }
        if (this.globalLevel === 'info') {
            console.log(error.message);
            console.log(error.stack);
        } else {
            throw (error);
        }
    }
}
