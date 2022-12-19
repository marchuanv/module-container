let globalLevel = 'error';
module.exports = (level = null) => {
    if (level && globalLevel && level !== globalLevel) {
        globalLevel = level;
    }
    return {
        log: ({ error, info }) => {
            if (globalLevel === 'error' && error) {
                console.error(error);
            } 
            if (globalLevel === 'info' && info) {
                console.log(info);
            }
        }
    }
}