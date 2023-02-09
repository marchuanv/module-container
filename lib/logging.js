let globalLevel = 'error';
module.exports = {
    setLevel: ({ level }) => {
        globalLevel = level;
    },
    log: ({ error, info }) => {
        if (globalLevel === 'error' && error) {
            if (!(error instanceof Error)) {
                throw new Error('logging failed to log, error argument passed is not of type Error');
            }
            console.error(error);
        }
        if (globalLevel === 'info' && info) {
            console.log(info);
        }
    }
}