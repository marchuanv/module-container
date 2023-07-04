export { Container, ContainerRegistry } from './container/registry.mjs';
export { Octokit } from 'octokit';
export { Routing } from './routing.mjs'
export { Logging } from './logging.mjs'
export { Store } from './store.mjs'
export { GithubBranch } from './github-branch.mjs'
export { GithubFile } from './github-file.mjs'

import { ContainerRegistry } from './container/registry.mjs';
import { Routing } from './routing.mjs'
import { Logging } from './logging.mjs'
import { Store } from './store.mjs'
import { GithubBranch } from './github-branch.mjs'
import { GithubFile } from './github-file.mjs'
import { Octokit } from 'octokit';

const registry = new ContainerRegistry();
registry.registerSingleton({ type: Routing });
registry.registerSingleton({ type: Logging });
registry.registerSingleton({ type: Store });
registry.registerSingleton({ type: GithubBranch });
registry.registerSingleton({ type: GithubFile });
registry.registerSingleton({ type: Octokit, args: { auth: process.env.GIT } });
