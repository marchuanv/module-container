const github = require('./github');
const logging = require('./logging');
module.exports = ({ privateKey, branchName }) => {
   const octokit = github.login({ privateKey });
   return {
      isExisting: async () => {
         try {
            await octokit.request(`GET /repos/marchuanv/active-objects/branches/${branchName}`);
            return true;
         } catch (error) {
            logging.log({ error });
            logging.log({ info: error.message });
            logging.log({ info: error.stack });
            return false;
         }
      },
      create: async () => {
         try {
            const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
            const revision = data.shift().object.sha;
            await octokit.request(`POST /repos/marchuanv/active-objects/git/refs`, {
               ref: `refs/heads/${branchName}`,
               sha: revision
            });
         } catch(error) {
            logging.log({ error });
            logging.log({ info: error.message });
            logging.log({ info: error.stack });
         }
      },
      delete: async () => {
         try {
            await octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}`);
         } catch(error) {
            logging.log({ error });
            logging.log({ info: error.message });
            logging.log({ info: error.stack });
         }
      }
   }
}
