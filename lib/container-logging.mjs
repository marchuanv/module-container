const messages = [];
function sort(array) {
   return array.sort((msgA, msgB) => (msgB.microTime < msgA.microTime) ? -1 : ((msgB.microTime > msgA.microTime) ? 1 : 0));
}
export class ContainerLogging {
   log(message) {
      if (process.environment.logging.enabled) {
         const microTime = process.hrtime.bigint();
         messages.push({ message, microTime, context: this });
      }
   }
}
process.on('exit', () => {
   const _messages = sort(messages);
   for (const { message, microTime, context } of _messages) {
      const contextName = context.contextName;
      const contextId = context.contextId;
      for (const event of sort(context.raisedEvents.filter(e => e.microTime < microTime))) {
         console.log(`MicroTime: ${event.microTime}, Container(${contextId}): ${event.contextName}, MemberCalled: ${event.name}(${event.Id})`);
      }
      console.log(`MicroTime: ${microTime}, Container(${contextId}): ${contextName}, MemberCalled: Unknown`);
      console.log(`  -> ${message}`);
      for (const event of sort(context.raisedEvents.filter(e => e.microTime > microTime))) {
         console.log(`MicroTime: ${event.microTime}, Container(${contextId}): ${event.contextName}, MemberCalled: ${event.name}(${event.Id})`);
      }
   }
});