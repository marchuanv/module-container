import { Container, Logging, Octokit } from "./registry.mjs";
export class GithubBranch extends Container {
   constructor() {
      super();
      this.register({ Class: Logging });
      this.register({ Class: Octokit, ref: 'octokit', args: { auth: process.env.GIT } });
   }
   async exists({ branchName }) {
      try {
         await this.octokit.request(`GET /repos/marchuanv/active-objects/branches/${branchName}`);
         return true;
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
   async create({ branchName }) {
      let revision;
      try {
         const { data } = await this.octokit.request(`GET /repos/marchuanv/active-objects/git/refs/heads`);
         revision = data.shift().object.sha;
      } catch (error) {
         this.logging.log({ error });
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
   async delete({ branchName }) {
      try {
         await this.octokit.request(`DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}`);
         return true;
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
}
