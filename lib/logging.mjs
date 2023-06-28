export class Logging {
    globalLevel = 'error';
    setLevel({ level }) {
        this.globalLevel = level;
    }
    log({ error, info }) {
        if (this.globalLevel === 'error' && error) {
            if (!(error instanceof Error)) {
                throw new Error('logging failed to log, error argument passed is not of type Error');
            }
            console.error(error);
        }
        if (this.globalLevel === 'info' && info) {
            console.log(info);
        }
    }
}
