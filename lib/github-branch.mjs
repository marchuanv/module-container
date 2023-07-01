import { Container } from "./container.mjs";
export class GithubBranch extends Container {
   login({ privateKey }) {
      $octokit = github.login({ privateKey });
   }
   async isExisting({ branchName }) {
      try {
         await $octokit.request(`GET /repos/marchuanv/active-objects/branches/${branchName}`);
         return true;
      } catch (error) {
         $logging.log({ info: error.message });
         return false;
      }
   }
   async create({ branchName }) {
      try {
         const { data } = await $octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
         const revision = data.shift().object.sha;
         await $octokit.request(`POST /repos/marchuanv/active-objects/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: revision
         });
         return true;
      } catch (error) {
         $logging.log({ info: error.message });
         return false;
      }
   }
   async delete({ branchName }) {
      try {
         await $octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}`);
      } catch (error) {
         $logging.log({ info: error.message });
      }
   }
}
