const members = new WeakMap();
export class GithubFile {
   jsFileNameExp = /^.js$/g;
   jsonFileNameExp = /^.json$/g;
   constructor({ utils, logging, github }) {
      members.set(this, { utils, logging, github });
   }
   login({ privateKey }) {
      const github = members.get(this).github;
      const octokit = github.login({ privateKey });
      members.set(this, { octokit });
   }
   async getFileMetadata({ branchName, fileName }) {
      const { log } = members.get(this).logging;
      const octokit = members.get(this).octokit;
      try {
         const _fileName = fileName.replace(jsFileNameExp, '.js').replace(jsonFileNameExp, '.json');
         const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${_fileName}?ref=${branchName}`);
         return data;
      } catch (error) {
         log({ error });
         log({ info: error.message });
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
      const { log } = members.get(this).logging;
      const { base64ToString } = members.get(this).logging;
      try {
         const metadata = await this.getFileMetadata({ branchName, fileName });
         if (!metadata) {
            throw new Error(`no '${fileName}' file(s) in the '${branchName}' branch.`);
         }
         return base64ToString(metadata.content);
      } catch (error) {
         log({ error });
         log({ info: error.message });
         return null;
      }
   }
   async ensureFileContent({ branchName, fileName, content }) {
      const octokit = members.get(this).octokit;
      const { log } = members.get(this).logging;
      const { stringToBase64 } = members.get(this).utils;
      try {
         const metadata = await this.getFileMetadata({ branchName, fileName });
         const _fileName = fileName.replace(jsFileNameExp, '.js').replace(jsonFileNameExp, '.json');
         await octokit.request(`PUT /repos/marchuanv/active-objects/contents/${_fileName}`, {
            owner: 'marchuanv',
            repo: 'active-objects',
            path: `/${_fileName}`,
            message: 'created/updated',
            branch: branchName,
            committer: {
               name: 'active-objects-admin',
               email: 'active-objects-admin@gmail.com'
            },
            content: stringToBase64(content),
            sha: metadata?.sha
         });
         return true;
      } catch (error) {
         log({ error });
         log({ info: error.message });
         return false;
      }
   }
   async deleteFile({ branchName, fileName }) {
      const octokit = members.get(this).octokit;
      const { log } = members.get(this).logging;
      try {
         const metadata = await this.getFileMetadata({ branchName, fileName });
         const _fileName = fileName.replace(jsFileNameExp, '.js').replace(jsonFileNameExp, '.json');
         if (metadata) {
            await octokit.request(`DELETE /repos/marchuanv/active-objects/contents/${_fileName}`, {
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
         log({ error });
         log({ info: error.message });
         return false;
      }
   }
}
