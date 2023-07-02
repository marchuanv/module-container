import { ContainerRegistry } from "./container/container-registry.mjs";
import { Container } from "./container/container.mjs";
export class EndpointRegistry {
    /**
     * 
     * @param {RegExp} regEx 
     * @returns 
     */
    findHandler = (regEx) => {
        const container = new Container();
        const registry = new ContainerRegistry();
        const registeredTypes = registry.getRegisteredTypes();
        const endpointHandlerTypes = registeredTypes.filter(rt => rt.type.name.endsWith('Endpoint'));
        const enpoints = endpointHandlerTypes.map(eht => container[eht.ref]).filter(e => regEx.test(e.name));
        return enpoints[0];
    }
}
