import { CreateClassEndpoint } from './create-class-v1.mjs'
import { CreateConfigEndpoint } from './create-config-v1.mjs'
import { DeleteClassEndpoint } from './delete-class-v1.mjs'
import { DeleteConfigEndpoint } from './delete-config-v1.mjs'
import { GetClassEndpoint } from './get-class-v1.mjs'
import { GetConfigEndpoint } from './get-config-v1.mjs'

export let endpoints = {
    CreateClassEndpoint,
    CreateConfigEndpoint,
    DeleteClassEndpoint,
    DeleteConfigEndpoint,
    GetClassEndpoint,
    GetConfigEndpoint
};
