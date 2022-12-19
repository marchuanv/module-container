let globalLevel = 'error';
module.exports = {
    setLevel: ({ level }) => {
        globalLevel = level;
    },
    log: ({ error, info }) => {
        if (globalLevel === 'error' && error) {
            console.error(error);
        }
        if (globalLevel === 'info' && info) {
            console.log(info);
        }
    }
}