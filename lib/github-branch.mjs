import { Container } from './registry.mjs';
export class GithubBranch {
   async exists({ branchName }) {
      const { $octokitWithDefaults, $logging } = new Container();
      try {
         await $octokitWithDefaults.request(`GET /repos/marchuanv/active-objects/branches/${branchName}`);
         return true;
      } catch (error) {
         $logging.log({ error });
         return false;
      }
   }
   async create({ branchName }) {
      const { $octokitWithDefaults, $logging } = new Container();
      try {
         const { data } = await $octokitWithDefaults.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
         const revision = data.shift().object.sha;
         await $octokitWithDefaults.request(`POST /repos/marchuanv/active-objects/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: revision
         });
         return true;
      } catch (error) {
         $logging.log({ error });
         return false;
      }
   }
   async delete({ branchName }) {
      const { $octokitWithDefaults, $logging } = new Container();
      try {
         await $octokitWithDefaults.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}`);
      } catch (error) {
         $logging.log({ error });
      }
   }
}
