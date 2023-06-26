const github = require('./github');
const logging = require('./logging');
let octokit = null;
module.exports = {
   login: async ({ privateKey }) => {
      octokit = github.login({ privateKey });
   },
   isExisting: async ({ branchName }) => {
      try {
         await octokit.request(`GET /repos/marchuanv/active-objects/branches/${branchName}`);
         return true;
      } catch (error) {
         logging.log({ error });
         logging.log({ info: error.message });
         return false;
      }
   },
   create: async ({ branchName }) => {
      try {
         const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
         const revision = data.shift().object.sha;
         await octokit.request(`POST /repos/marchuanv/active-objects/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: revision
         });
         return true;
      } catch (error) {
         logging.log({ error });
         logging.log({ info: error.message });
         return false;
      }
   },
   delete: async ({ branchName }) => {
      try {
         await octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}`);
      } catch (error) {
         logging.log({ error });
         logging.log({ info: error.message });

      }
   }
}
