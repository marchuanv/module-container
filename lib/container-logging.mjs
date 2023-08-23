const messages = [];
export class ContainerLogging {
   log(message) {
      const microTime = process.hrtime.bigint();
      const events = this.raisedEvents;
      messages.push({ contextName: this.contextName, date: new Date(), message, events, microTime });
   }
}
process.on('exit', () => {
   console.clear();
   for (const { contextName, message, events, microTime } of messages) {
      if (events.length > 0) {
         for (const event of events) {
            if (event.microTime < microTime) {
               if (microTime > event.microTime) {
                  console.log(`Context: ${event.contextName}, Event: ${event.name} -> ${message}`);
               } else {
                  console.log(`Context: ${event.contextName}, Event: ${event.name} raised`);
               }
            }
         }
      } else {
         console.log(message);
      }
   }
});