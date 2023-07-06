import { Container, Logging, Github } from "./registry.mjs";
export class GithubBranch extends Container {
   constructor({ branchName, token }) {
      super();
      this.dependency({
         Logging,
         Github,
         ctorArgs: { auth: token },
         branchName
      });
      this.logging.setToInfo();
   }
   async exists() {
      try {
         await this.github.request({ route: `GET /repos/marchuanv/active-objects/branches/${this.branchName}` });
         return true;
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
   async create() {
      let revision;
      try {
         const { data } = await this.github.request({ route: `GET /repos/marchuanv/active-objects/git/refs/heads` });
         revision = data.shift().object.sha;
      } catch (error) {
         this.logging.log({ error });
      }
      if (revision) {
         try {
            await this.github.request({
               route: `POST /repos/marchuanv/active-objects/git/refs`, options: {
                  ref: `refs/heads/${this.branchName}`,
                  sha: revision
               }
            });
            return true;
         } catch (error) {
            this.logging.log({ error });
         }
      }
      return false;
   }
   async delete() {
      try {
         await this.github.request({ route: `DELETE /repos/marchuanv/active-objects/git/refs/heads/${this.branchName}` });
         return true;
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
}
