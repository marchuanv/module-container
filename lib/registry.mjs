export { Container } from './container/container.mjs'

import { Octokit } from 'octokit';
import { ContainerRegistry } from './container/container-registry.mjs'
import { v1Endpoint } from './endpoints/v1.mjs'
import { CreateClassEndpoint } from './endpoints/active-object/create-class.mjs'
import { CreateConfigEndpoint } from './endpoints/active-object/create-config.mjs'
import { DeleteClassEndpoint } from './endpoints/active-object/delete-class.mjs'
import { DeleteConfigEndpoint } from './endpoints/active-object/delete-config.mjs'
import { GetClassEndpoint } from './endpoints/active-object/get-class.mjs'
import { GetConfigEndpoint } from './endpoints/active-object/get-config.mjs'
import { EndpointRegistry } from './endpoint-registry.mjs'
import { Logging } from './logging.mjs'
import { Store } from './store.mjs'
import { GithubBranch } from './github-branch.mjs'
import { GithubFile } from './github-file.mjs'

const registry = new ContainerRegistry();
registry.registerSingleton({ type: v1Endpoint });
registry.registerSingleton({ type: CreateClassEndpoint });
registry.registerSingleton({ type: CreateConfigEndpoint });
registry.registerSingleton({ type: DeleteClassEndpoint });
registry.registerSingleton({ type: DeleteConfigEndpoint });
registry.registerSingleton({ type: GetClassEndpoint });
registry.registerSingleton({ type: GetConfigEndpoint });
registry.registerSingleton({ type: EndpointRegistry });
registry.registerSingleton({ type: Logging });
registry.registerSingleton({ type: Store });
registry.registerSingleton({ type: GithubBranch });
registry.registerSingleton({ type: GithubFile });
registry.registerSingleton({ type: Octokit, args: [ process.env.GIT ] });
