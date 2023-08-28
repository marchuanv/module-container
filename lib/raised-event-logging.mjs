import { RaisedEventLoggingReference } from "./references/raised-event-logging-reference.mjs";
let refs = new WeakMap();
export class RaisedEventLogging extends RaisedEventLoggingReference {
   /**
     * @param {String} name
     * @param {ReferenceId} memberEventRefId
     */
   constructor() {
      super('raisedEventLogging');
      refs.set(this, []);
   }
   /**
    * @param {ReferenceId} raisedEventRefId
    */
   push(raisedEventRefId) {
      refs.get(this).push(raisedEventRefId);
   }
}
process.on('exit', () => {

});

function sortDesc(array) {
   return array.sort((msgA, msgB) => (msgB.microTime < msgA.microTime) ? -1 : ((msgB.microTime > msgA.microTime) ? 1 : 0));
}
function sortAsc(array) {
   return array.sort((msgA, msgB) => (msgA.microTime < msgB.microTime) ? -1 : ((msgA.microTime > msgB.microTime) ? 1 : 0));
}