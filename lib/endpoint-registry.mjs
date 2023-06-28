const members = new WeakMap();
import {
    CreateClass,
    CreateConfig,
    DeleteClass,
    DeleteConfig,
    GetClass,
    GetConfig,
    v1
} from './endpoints/index.mjs'
export class EndpointRegistry {
    constructor({ path, utils, store, logging, vm }) {
        const rootFileNameExp = /^v[0-9]+.js$/g;
        const handlers = [
            CreateClass,
            CreateConfig,
            DeleteClass,
            DeleteConfig,
            GetClass,
            GetConfig,
            v1
        ];
        let Type = handlers.shift();
        do {
            const handler = new Type({ path, utils, store, logging, vm, registry: this });
            rootFileNameExp.lastIndex = -1;
            if (rootFileNameExp.test(handler.name)) { //root handlers
                handlers.push(handler);
            } else {
                handlers.push(handler);
            }
            Type = handlers.shift();
        } while (Type && Type.toString().indexOf(`class ${Type.name}`) > -1)
        members.set(this, { handlers });
    }
    findHandler = (regEx) => {
        regEx.lastIndex = -1;
        const matchingHandlers = members.get(this).handlers.filter(h => regEx.test(h.name) && !h.isRoot);
        return matchingHandlers[0];
    }
    findRootHandler = (regEx) => {
        regEx.lastIndex = -1;
        const matchingHandlers = members.get(this).handlers.filter(h => regEx.test(h.name) && h.isRoot);
        return matchingHandlers[0];
    }
}
