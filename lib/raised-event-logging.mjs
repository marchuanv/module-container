import { RaisedEventSubscription } from "./raised-event-subscription.mjs";
import { Reference } from "./reference/reference.mjs";
const privateBag = new WeakMap();
privateBag.set(RaisedEventLogging, []);
export class RaisedEventLogging extends Reference {
   /**
    * @param {ReferenceId} raisedEventSubscriptionRefId
    */
   constructor(raisedEventSubscriptionRefId) {
      super('raisedeventlogging');
      super.dependency = raisedEventSubscriptionRefId;
      const raisedEventSubscription = super.get(RaisedEventSubscription.prototype);
      raisedEventSubscription.subscribe((raisedEvent) => {
         privateBag.get(RaisedEventLogging).unshift(raisedEvent);
      });
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

function sortDesc(array) {
   return array.sort((msgA, msgB) => (msgB.microTime < msgA.microTime) ? -1 : ((msgB.microTime > msgA.microTime) ? 1 : 0));
}
function sortAsc(array) {
   return array.sort((msgA, msgB) => (msgA.microTime < msgB.microTime) ? -1 : ((msgA.microTime > msgB.microTime) ? 1 : 0));
}