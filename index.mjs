import Jasmine from 'jasmine';
import * as url from 'url';
if (typeof process.env.INFO !== 'object') {
    const info = JSON.parse(process.env.INFO);
    process.environment = info;
}
const __dirname = url.fileURLToPath(new URL('./specs/', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.execute();

