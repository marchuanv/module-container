let _logs = [];
process.on("exit", () => {
    _logs = _logs.sort((x, y) => x.date.getTime() - y.date.getTime());
    const contextIds = [...new Set(_logs.map(x => x.contextId))];
    const contextNames = [...new Set(_logs.map(x => x.contextName))];
    for(const contextName of contextNames) {
        console.log(`\r\n${contextName}\r\n`);
        for (const contextId of contextIds) {
            if (_logs.find(x => x.contextName == contextName && x.contextId === contextId)) {
                console.log(`\r\n   ${contextId}\r\n`);
                for (let { date, message } of _logs.filter(x => x.contextId === contextId)) {
                    date = JSON.stringify(date);
                    if (message instanceof Error) {
                        console.log(`       Date: ${date}`);
                        console.error(message);
                    } else {
                        console.log(`       ${date}: ${message}`);
                    }
                }
            }
        }
    }
});

export class Logging {
    constructor({ contextId, contextName }) {
        this.contextId = contextId;
        this.contextName = contextName;
    }
    async log(message) {
        _logs.push({ 
            contextId: this.contextId,
            contextName: this.contextName,
            date: new Date(),
            message
        });
    }
}