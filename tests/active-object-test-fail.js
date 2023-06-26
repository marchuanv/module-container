const { readFileSync } = require('fs');
const { test } = require('./test-runner.js');
const path = require('path');
const moduleName = 'active-object';
const url = '/test/doTest1';
const scriptFilePath = path.join(__dirname, 'active-object-test-fail-script.js');
const script = readFileSync(scriptFilePath, { encoding: 'utf8' });
const input = {};
const sessionId = 'c62120de-30d4-40a1-8fef-0a6133efdee6';

(async () => {
  const { createSession } = await require('../lib/store');
  const { session } = await createSession({ sessionId });
  const { writeFileSync } = session;
  writeFileSync(scriptFilePath, script);
  const testName = 'active-object-test-fail';
  (await test({ testName, moduleName, functionName: 'activate', testParams: { sessionId, url, scriptFilePath, input } })).assert((res) => res === false ? true : false);
  (await test({ testName, moduleName, functionName: 'call', testParams: { sessionId, url, scriptFilePath, input } })).assert((res) => res.message && res.stack);
})();
