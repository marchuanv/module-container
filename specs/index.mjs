import Jasmine from 'jasmine';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
console.clear();
process.env.LOG = false;
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.execute();