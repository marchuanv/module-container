import { ActiveObjectServer } from './lib/registry.mjs'
const server = new ActiveObjectServer();
server.start().catch((err) => {
    console.log(err);
});