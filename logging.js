let globalLevel = 'error';
module.exports = {
    setLevel: ({ level }) => {
        globalLevel = level;
    },
    log: ({ error, info }) => {
        if ( !(error instanceof Error) ) {
            throw new Error('logging failed to log, error argument passed is not of type Error');
        }
        if (globalLevel === 'error' && error) {
            console.error(error);
        }
        if (globalLevel === 'info' && info) {
            console.log(info);
        }
    }
}