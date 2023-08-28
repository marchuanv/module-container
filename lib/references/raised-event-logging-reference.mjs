import { RaisedEventLogging } from "../raised-event-logging.mjs";
import { Reference } from "./reference.mjs";
export class RaisedEventLoggingReference extends Reference {
   /**
     * @param {String} name
     */
   constructor(name) {
      super(name, this, RaisedEventLogging);
   }
}
