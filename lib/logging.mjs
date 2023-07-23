let _logs = [];
process.on("exit", () => {
    _logs = _logs.sort((x,y) => x.date.getTime() - y.date.getTime());
    const contexts = [...new Set(_logs.map(x => x.context))];
    for(const context of contexts) {
        console.log('\r\n');
        console.log(context);
        for(const { date, message } of _logs.filter(x => x.context === context)) {
            if (message instanceof Error) {
                console.log(`Date: ${JSON.stringify(date)}`);
                console.error(message);
            } else {
                const text = JSON.stringify({ date, message });
                console.log(text);
            }
        }
    }
});
export class Logging {
    constructor({ contextId }) {
        this.contextId = contextId;
    }
    log(message) {
        _logs.push({ context: this.contextId, date: new Date(), message });
    }
}