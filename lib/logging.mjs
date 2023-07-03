export class Logging {
    globalLevel = 'unknown';
    setToInfo() {
        this.globalLevel = "info";
    }
    setToError() {
        this.globalLevel = "error";
    }
    log({ error }) {
        if (this.globalLevel === 'info') {
            if (error) {
                console.log(error);
            } else {
                throw new Error(`logging level was NOT provided and is currently set to: ${this.globalLevel}, this will hide the actual error`);
            }
        } else {
            if (error) {
                if (error instanceof Error) {

                } else {
                    throw new Error('error argument passed to Logging.log() is not of type: Error');
                }
                console.error(error);
            } else {
                throw new Error(`logging level was NOT provided and is currently set to: ${this.globalLevel}, this will hide the actual error`);
            }
        }
    }
}
