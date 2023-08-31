import { Reference } from "../reference/reference.mjs";
import { RaisedEventStack } from "../stack/raised-event-stack.mjs";
import { RaisedEventSubscription } from "./raised-event-subscription.mjs";
import { RaisedEvent } from "./raised-event.mjs";
const privateBag = new WeakMap();
export class RaisedEventLogging extends Reference {
   /**
    * @param {ReferenceId} raisedEventStackRefId
    */
   constructor(raisedEventStackRefId) {
      super('raisedeventlogging');
      super.addReference(raisedEventStackRefId, RaisedEventStack.prototype);
      const raisedEventSubscription = new RaisedEventSubscription()
      const raisedEventStack = super.getReference(RaisedEventStack.prototype);
      for (const raisedEvent of raisedEventStack.getAllReferences(RaisedEvent)) {
         privateBag.get()
      }
   }
}
process.on('exit', () => {
   // let formattedMessages = [];
   // const raisedEvents = references.set(RaisedEvents, []);
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
privateBag.set(RaisedEventLogging, []);

function sortDesc(array) {
   return array.sort((msgA, msgB) => (msgB.microTime < msgA.microTime) ? -1 : ((msgB.microTime > msgA.microTime) ? 1 : 0));
}
function sortAsc(array) {
   return array.sort((msgA, msgB) => (msgA.microTime < msgB.microTime) ? -1 : ((msgA.microTime > msgB.microTime) ? 1 : 0));
}