import { Container, Logging, Octokit } from "./registry.mjs";
export class GithubFile extends Container {
   jsFileNameExp = /^.js$/g;
   jsonFileNameExp = /^.json$/g;
   constructor({ branchName, fileName, token }) {
      super();
      this.addDependency({ Class: Logging });
      this.addDependency({ Class: Octokit, ref: 'octokit', args: { auth: token } });
      this.bag.branchName = branchName;
      this.bag.fileName = fileName;
      (await this.logging).setToInfo();
   }
   async getMetadata() {
      try {
         const { branchName, fileName } = this.bag;
         const _fileName = fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         const response = await this.octokit.request(`GET /repos/marchuanv/active-objects/contents/${_fileName}?ref=${branchName}`);
         const { data } = response;
         return data;
      } catch (error) {
         (await this.logging).log({ error });
         return null;
      }
   }
   async exists() {
      try {
         const { branchName, fileName } = this.bag;
         const metadata = await this.getMetadata({ branchName, fileName });
         if (metadata) {
            return true;
         }
         return false;
      } catch (error) {
         (await this.logging).log({ error });
         return false;
      }
   }
   async getContent() {
      try {
         const { branchName, fileName } = this.bag;
         const metadata = await this.getMetadata({ branchName, fileName });
         if (!metadata) {
            throw new Error(`no '${fileName}' file(s) in the '${branchName}' branch.`);
         }
         return (await this.utils).base64ToString(metadata.content);
      } catch (error) {
         (await this.logging).log({ error });
         return null;
      }
   }
   async ensureContent() {
      const { branchName, fileName, content } = this.bag;
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
            content: (await this.utils).stringToBase64(content),
            sha: metadata?.sha
         });
         return true;
      } catch (error) {
         (await this.logging).log({ error });
         return false;
      }
   }
   async delete() {
      const { branchName, fileName } = this.bag;
      try {
         const metadata = await this.getMetadata({ branchName, fileName });
         const _fileName = fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         if (metadata) {
            await this.octokit.request(`DELETE /repos/marchuanv/active-objects/contents/${_fileName}`, {
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
         (await this.logging).log({ error });
         return false;
      }
   }
}
