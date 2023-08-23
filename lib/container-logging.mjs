const messages = [];
export class ContainerLogging {
   log(message) {
      const event = this.raisedEvents.find(e => e.contextName === this.contextName && e.date < date);
      messages.push({ contextName: this.contextName, date: new Date(), message, event });
   }
}
process.on('exit', () => {
   console.clear();
   for (const { date, message, event } of messages) {
      if (event) {
         console.log(`Context: ${this.contextName}, Event: ${event.name} -> ${message}`);
      } else {
         console.log(message);
      }
   }
});