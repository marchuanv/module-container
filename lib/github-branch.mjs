const members = new WeakMap();
export class GithubBranch {
   constructor({ logging, github }) {
      members.set(this, { logging, github });
   }
   login({ privateKey }) {
      const github = members.get(this).github;
      const octokit = github.login({ privateKey });
      members.set(this, { octokit });
   }
   async isExisting({ branchName }) {
      const { log } = members.get(this).logging;
      const octokit = members.get(this).octokit;
      try {
         await octokit.request(`GET /repos/marchuanv/active-objects/branches/${branchName}`);
         return true;
      } catch (error) {
         log({ error });
         log({ info: error.message });
         return false;
      }
   }
   async create({ branchName }) {
      const { log } = members.get(this).logging;
      const octokit = members.get(this).octokit;
      try {
         const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
         const revision = data.shift().object.sha;
         await octokit.request(`POST /repos/marchuanv/active-objects/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: revision
         });
         return true;
      } catch (error) {
         log({ error });
         log({ info: error.message });
         return false;
      }
   }
   async delete({ branchName }) {
      const { log } = members.get(this).logging;
      const octokit = members.get(this).octokit;
      try {
         await octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}`);
      } catch (error) {
         log({ error });
         log({ info: error.message });
      }
   }
}
