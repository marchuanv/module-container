import Jasmine from 'jasmine';
import * as url from 'url';
process.env.LOG = JSON.stringify({ enabled: false, onExit: true });
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
console.clear();
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
jasmine.execute();