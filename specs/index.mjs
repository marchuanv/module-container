import Jasmine from 'jasmine';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
process.env.LOG = true;
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.execute();