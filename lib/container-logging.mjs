const messages = [];
export class ContainerLogging {
   log(message) {
      const microTime = process.hrtime.bigint();
      messages.push({ message, microTime, context: this });
   }
}
process.on('exit', () => {
   const _messages = messages.sort((msgA, msgB) => (msgB.microTime < msgA.microTime) ? -1 : ((msgB.microTime > msgA.microTime) ? 1 : 0));
   for (const { message, microTime, context } of _messages) {
      const contextName = context.contextName;
      for (const event of context.raisedEvents.filter(e => e.microTime < microTime)) {
         console.log(`MicroTime: ${event.microTime}, Container: ${event.contextName}, MemberCalled: ${event.name}`);
      }
      console.log(`MicroTime: ${microTime}, Container: ${contextName}, MemberCalled: Unknown`);
      console.log(`  -> ${message}`);
      for (const event of context.raisedEvents.filter(e => e.microTime > microTime)) {
         console.log(`MicroTime: ${event.microTime}, Container: ${event.contextName}, MemberCalled: ${event.name}`);
      }
   }
});