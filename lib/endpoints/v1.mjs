const members = new WeakMap();
export class v1 {
    name = 'v1';
    isRoot = true;
    constructor({ utils, logging, registry }) {
        const activeObjEndpointExp = /^\/api\/v[0-9]+\/active-object\/[a-zA-Z]+\/[a-zA-Z]+\/[a-zA-Z0-9]+$/g;
        const expressions = [
            { path: /active-object\/config\/get/g, name: /active-object-config-get/g },
            { path: /active-object\/config\/create/g, name: /active-object-config-create/g },
            { path: /active-object\/config\/remove/g, name: /active-object-config-remove/g },
            { path: /active-object\/class\/get/g, name: /active-object-class-get/g },
            { path: /active-object\/class\/create/g, name: /active-object-class-create/g },
            { path: /active-object\/class\/remove/g, name: /active-object-class-remove/g }
        ];
        members.set(this, { utils, logging, registry, expressions });
    }
    handle({ path, content, headers }) {
        let handler = null;
        const { utils: { getJSONString }, logging: { log }, registry: { findHandler }, expressions } = members.get(this);
        for (const exp of expressions) {
            if (exp.path.test(path)) {
                handler = findHandler(exp.name);
            }
        }
        if (handler) {
            try {
                handler.handle({ path, content, headers })
            } catch (error) {
                log({ error });
            }
        } else {
            return {
                contentType: 'application/json',
                statusCode: 404,
                statusMessage: '404 Not Found',
                responseContent: getJSONString({ message: 'no request handlers was found.' })
            };
        }
    }
}
