import Jasmine from 'jasmine';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.execute();