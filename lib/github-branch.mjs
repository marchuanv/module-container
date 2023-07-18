import { Container, Github, GithubFake } from "./registry.mjs";
export class GithubBranch extends Container {
   constructor({ branchName, token }) {
      super({
         github: {
            type: { Github },
            args: { auth: token }
         },
         branch: {
            name: 'branchName',
            value: branchName
         },
         githubFake: {
            type: { Github },
            typeFake: { GithubFake },
            args: { auth: token }
         }
      });
   }
   async exists() {
      await this.github.request({ route: `GET /repos/marchuanv/active-objects/branches/${this.branchName}` });
      return true;
   }
   async create() {
      const { data } = await this.github.request({ route: `GET /repos/marchuanv/active-objects/git/refs/heads` });
      let revision = data.shift().object.sha;
      if (revision) {
         await this.github.request({
            route: `POST /repos/marchuanv/active-objects/git/refs`, parameters: {
               ref: `refs/heads/${this.branchName}`,
               sha: revision
            }
         });
         return true;
      }
      return false;
   }
   async delete() {
      await this.github.request({ route: `DELETE /repos/marchuanv/active-objects/git/refs/heads/${this.branchName}` });
      return true;
   }
}
