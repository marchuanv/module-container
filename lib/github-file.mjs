import { Container, Logging, Octokit } from "./registry.mjs";
export class GithubFile extends Container {
   jsFileNameExp = /^.js$/g;
   jsonFileNameExp = /^.json$/g;
   register({ registry }) {
      registry.registerSingleton({ type: Logging });
      registry.registerSingleton({ type: Octokit, ref: 'octokit', args: { auth: process.env.GIT } });
   }
   async getMetadata({ branchName, fileName }) {
      try {
         const _fileName = fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         const response = await this.octokit.request(`GET /repos/marchuanv/active-objects/contents/${_fileName}?ref=${branchName}`);
         const { data } = response;
         return data;
      } catch (error) {
         this.logging.log({ error });
         return null;
      }
   }
   async exists({ branchName, fileName }) {
      try {
         const metadata = await this.getMetadata({ branchName, fileName });
         if (metadata) {
            return true;
         }
         return false;
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
   async getContent({ branchName, fileName }) {
      try {
         const metadata = await this.getMetadata({ branchName, fileName });
         if (!metadata) {
            throw new Error(`no '${fileName}' file(s) in the '${branchName}' branch.`);
         }
         return this.utils.base64ToString(metadata.content);
      } catch (error) {
         this.logging.log({ error });
         return null;
      }
   }
   async ensureContent({ branchName, fileName, content }) {
      try {
         const metadata = await this.getMetadata({ branchName, fileName });
         const _fileName = fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         await this.octokit.request(`PUT /repos/marchuanv/active-objects/contents/${_fileName}`, {
            owner: 'marchuanv',
            repo: 'active-objects',
            path: `/${_fileName}`,
            message: 'created/updated',
            branch: branchName,
            committer: {
               name: 'active-objects-admin',
               email: 'active-objects-admin@gmail.com'
            },
            content: this.utils.stringToBase64(content),
            sha: metadata?.sha
         });
         return true;
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
   async delete({ branchName, fileName }) {
      const { $logging, $octokitWithDefaults } = new Container();
      try {
         const metadata = await this.getMetadata({ branchName, fileName });
         const _fileName = fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         if (metadata) {
            await $octokitWithDefaults.request(`DELETE /repos/marchuanv/active-objects/contents/${_fileName}`, {
               owner: 'marchuanv',
               repo: 'active-objects',
               path: `/${_fileName}`,
               message: 'deleted',
               branch: branchName,
               committer: {
                  name: 'active-objects-admin',
                  email: 'active-objects-admin@gmail.com'
               },
               sha: metadata?.sha
            });
            return true;
         }
      } catch (error) {
         $logging.log({ error });
         return false;
      }
   }
}
