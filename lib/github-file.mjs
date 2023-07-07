import { Container, Logging, Github } from "./registry.mjs";
import utils from 'utils'
export class GithubFile extends Container {
   jsFileNameExp = /^.js$/g;
   jsonFileNameExp = /^.json$/g;
   constructor({ branchName, fileName, token }) {
      super();
      this.dependency({
         logging: {
            Logging,
            ctorArgs: { logLevel: 'info' }
         },
         github: {
            Github,
            ctorArgs: { auth: token }
         },
         branchName,
         fileName,
         utils
      });
   }
   async getMetadata() {
      try {
         const _fileName = this.fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         const response = await this.github.request({ route: `GET /repos/marchuanv/active-objects/contents/${_fileName}?ref=${this.branchName}` });
         const { data } = response;
         return data;
      } catch (error) {
         this.logging.log({ error });
         return null;
      }
   }
   async exists() {
      try {
         const metadata = await this.getMetadata();
         if (metadata) {
            return true;
         }
         return false;
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
   async getContent() {
      try {
         const metadata = await this.getMetadata();
         if (!metadata) {
            throw new Error(`no '${this.fileName}' file(s) in the '${this.branchName}' branch.`);
         }
         return this.utils.base64ToString(metadata.content);
      } catch (error) {
         this.logging.log({ error });
         return null;
      }
   }
   async ensureContent() {
      try {
         const metadata = await this.getMetadata();
         const _fileName = this.fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         await this.github.request({
            route: `PUT /repos/marchuanv/active-objects/contents/${_fileName}`, parameters: {
               owner: 'marchuanv',
               repo: 'active-objects',
               path: `/${_fileName}`,
               message: 'created/updated',
               branch: this.branchName,
               committer: {
                  name: 'active-objects-admin',
                  email: 'active-objects-admin@gmail.com'
               },
               content: this.utils.stringToBase64(content),
               sha: metadata?.sha
            }
         });
         return true;
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
   async delete() {
      try {
         const metadata = await this.getMetadata();
         const _fileName = fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         if (metadata) {
            await this.github.request({
               route: `DELETE /repos/marchuanv/active-objects/contents/${_fileName}`, parameters: {
                  owner: 'marchuanv',
                  repo: 'active-objects',
                  path: `/${_fileName}`,
                  message: 'deleted',
                  branch: this.branchName,
                  committer: {
                     name: 'active-objects-admin',
                     email: 'active-objects-admin@gmail.com'
                  },
                  sha: metadata?.sha
               }
            });
            return true;
         }
      } catch (error) {
         this.logging.log({ error });
         return false;
      }
   }
}
