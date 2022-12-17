const github = require('./github');
module.exports = {
   isExisting = async ({ branchName }) => {
     try {
        const octokit = await github.login();
        await octokit.request(`GET /repos/marchuanv/active-objects/branches/${branchName}`);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    },
    create = async ({ branchName }) => {
      try {
        const octokit = await github.login();
        const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
        const revision = data.shift().object.sha;
        await octokit.request(`POST /repos/marchuanv/active-objects/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: revision
        });
      } catch(error) {
        console.error(error);
      }
   },
   delete: async () => {
      try {
         await octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}`);
      } catch(error) {
         console.log(error);
      }
   }
}
