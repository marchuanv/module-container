export { Container } from './container/container.mjs'
import { Octokit } from 'octokit';

import { ContainerRegistry } from './container/container-registry.mjs'
import { v1 } from './endpoints/v1.mjs'
import { CreateClass } from './endpoints/active-object/create-class.mjs'
import { CreateConfig } from './endpoints/active-object/create-config.mjs'
import { DeleteClass } from './endpoints/active-object/delete-class.mjs'
import { DeleteConfig } from './endpoints/active-object/delete-config.mjs'
import { GetClass } from './endpoints/active-object/get-class.mjs'
import { GetConfig } from './endpoints/active-object/get-config.mjs'
import { EndpointRegistry } from './endpoint-registry.mjs'
import { Logging } from './logging.mjs'
import { Store } from './store.mjs'
import { GithubBranch } from './github-branch.mjs'
import { GithubFile } from './github-file.mjs'

const registry = new ContainerRegistry();
registry.registerSingleton({ type: v1 });
registry.registerSingleton({ type: CreateClass });
registry.registerSingleton({ type: CreateConfig });
registry.registerSingleton({ type: DeleteClass });
registry.registerSingleton({ type: DeleteConfig });
registry.registerSingleton({ type: GetClass });
registry.registerSingleton({ type: GetConfig });
registry.registerSingleton({ type: EndpointRegistry });
registry.registerSingleton({ type: Logging });
registry.registerSingleton({ type: Store });
registry.registerSingleton({ type: GithubBranch });
registry.registerSingleton({ type: GithubFile });
registry.registerSingleton({ type: Octokit, args: [ process.env.GIT ] });
