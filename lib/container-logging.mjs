import utils from "utils";

const messages = new Map();
let references = new WeakMap();
class RaisedEvents { };
export class ContainerLogging {
   constructor({ references }) {
      references = references;
   }
   log(message) {
      if (process.environment.logging.enabled) {
         const microTime = process.hrtime.bigint();
         messages.set(utils.generateGUID(), { message, microTime, context: this });
      }
   }
}
process.on('exit', () => {
   let formattedMessages = [];
   const raisedEvents = references.set(RaisedEvents, []);
   // for (const { message, context, microTime } of _messages) {
   //    const contextName = context.contextName;
   //    const contextId = context.contextId;
   //    const eventId = 'None';
   //    const memberName = 'Log';
   //    const memberId = 'None';
   //    formattedMessages.push({ microTime, contextName, contextId, memberName, memberId, eventId, message });
   // }
   // for (const { microTime, contextName, contextId, name, memberId, Id } of raisedEvents) {
   //    const memberName = name;
   //    const eventId = Id;
   //    const message = 'None';
   //    formattedMessages.push({ microTime, contextName, contextId, memberName, memberId, eventId, message });
   // }
   // for (const { microTime, contextName, contextId, memberName, memberId, eventId, message } of sortAsc(formattedMessages)) {
   //    console.log(`MicroTime: ${microTime}, ${contextName}(${contextId}), ${memberName}(${memberId}), Event Id: ${eventId}, \r\n -> Message: ${message}`);
   // }
});

function sortDesc(array) {
   return array.sort((msgA, msgB) => (msgB.microTime < msgA.microTime) ? -1 : ((msgB.microTime > msgA.microTime) ? 1 : 0));
}
function sortAsc(array) {
   return array.sort((msgA, msgB) => (msgA.microTime < msgB.microTime) ? -1 : ((msgA.microTime > msgB.microTime) ? 1 : 0));
}