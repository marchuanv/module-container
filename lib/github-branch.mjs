const members = new WeakMap();
export class GithubBranch {
   constructor({ logging, github }) {
      const octokit = { request: () => { console.log('octokit needs to be authorised, call the login method.'); } };
      members.set(this, { logging, github, octokit });
   }
   login({ privateKey }) {
      const { logging, github } = members.get(this);
      const octokit = github.login({ privateKey });
      members.set(this, { logging, github, octokit });
   }
   async isExisting({ branchName }) {
      const { logging, octokit } = members.get(this);
      try {
         await octokit.request(`GET /repos/marchuanv/active-objects/branches/${branchName}`);
         return true;
      } catch (error) {
         logging.log({ info: error.message });
         return false;
      }
   }
   async create({ branchName }) {
      const { logging, octokit } = members.get(this);
      try {
         const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
         const revision = data.shift().object.sha;
         await octokit.request(`POST /repos/marchuanv/active-objects/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: revision
         });
         return true;
      } catch (error) {
         logging.log({ info: error.message });
         return false;
      }
   }
   async delete({ branchName }) {
      const { logging, octokit } = members.get(this);
      try {
         await octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}`);
      } catch (error) {
         logging.log({ info: error.message });
      }
   }
}
