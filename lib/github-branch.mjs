import { Container, Logging, Octokit } from "./registry.mjs";
export class GithubBranch extends Container {
   constructor({ branchName, token }) {
      super();
     this.dependency({ Class: Logging });
     this.dependency({ Class: Octokit, ref: 'octokit', args: { auth: token } });
      this.bag.branchName = branchName;
      (await this.logging).setToInfo();
   }
   async exists() {
      try {
         const { branchName } = this.bag;
         await this.octokit.request(`GET /repos/marchuanv/active-objects/branches/${branchName}`);
         return true;
      } catch (error) {
         (await this.logging).log({ error });
         return false;
      }
   }
   async create() {
      let revision;
      const { branchName } = this.bag;
      try {
         const { data } = await this.octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
         revision = data.shift().object.sha;
      } catch (error) {
         (await this.logging).log({ error });
      }
      if (revision) {
         try {
            await this.octokit.request(`POST /repos/marchuanv/active-objects/git/refs`, {
               ref: `refs/heads/${branchName}`,
               sha: revision
            });
            return true;
         } catch (error) {
            this.logging.log({ error });
         }
      }
      return false;
   }
   async delete() {
      const { branchName } = this.bag;
      try {
         await this.octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}`);
         return true;
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
}
