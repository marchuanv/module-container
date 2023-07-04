import Jasmine from 'jasmine';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.execute();