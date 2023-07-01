import { Container } from './registry.mjs';
export class GithubFile extends Container {
   jsFileNameExp = /^.js$/g;
   jsonFileNameExp = /^.json$/g;
   async getFileMetadata({ branchName, fileName }) {
      try {
         const _fileName = fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         const response = await $octokit.request(`GET /repos/marchuanv/active-objects/contents/${_fileName}?ref=${branchName}`);
         const { data } = response;
         return data;
      } catch (error) {
         $logging.log({ info: error.message });
         return null;
      }
   }
   async isExisting({ branchName, fileName }) {
      try {
         const metadata = await this.getFileMetadata({ branchName, fileName });
         if (metadata) {
            return true;
         }
         return false;
      } catch (error) {
         return false;
      }
   }
   async getFileContent({ branchName, fileName }) {
      try {
         const metadata = await this.getFileMetadata({ branchName, fileName });
         if (!metadata) {
            throw new Error(`no '${fileName}' file(s) in the '${branchName}' branch.`);
         }
         return $utils.base64ToString(metadata.content);
      } catch (error) {
         $logging.log({ info: error.message });
         return null;
      }
   }
   async ensureFileContent({ branchName, fileName, content }) {
      try {
         const metadata = await this.getFileMetadata({ branchName, fileName });
         const _fileName = fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         await $octokit.request(`PUT /repos/marchuanv/active-objects/contents/${_fileName}`, {
            owner: 'marchuanv',
            repo: 'active-objects',
            path: `/${_fileName}`,
            message: 'created/updated',
            branch: branchName,
            committer: {
               name: 'active-objects-admin',
               email: 'active-objects-admin@gmail.com'
            },
            content: $utils.stringToBase64(content),
            sha: metadata?.sha
         });
         return true;
      } catch (error) {
         $logging.log({ info: error.message });
         return false;
      }
   }
   async deleteFile({ branchName, fileName }) {
      try {
         const metadata = await this.getFileMetadata({ branchName, fileName });
         const _fileName = fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
         if (metadata) {
            await $octokit.request(`DELETE /repos/marchuanv/active-objects/contents/${_fileName}`, {
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
         $logging.log({ info: error.message });
         return false;
      }
   }
}
