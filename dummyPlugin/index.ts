// #!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {timeout} from 'clientnode'

import {
    Configuration,
    PluginHandler,
    PluginPromises,
    ServicePromisesState,
    Services
} from '../type'
// endregion
/**
 * Loads dummy service.
 * @param state - Application state.
 * @param state.services - Plugin services.
 * @returns A mapping to promises which correspond to the plugin specific
 * continues services.
 */
export const loadService = ({services}:ServicePromisesState):Promise<
    PluginPromises
> => {
    services.dummy = {
        hookCalled: false,
        loaded: true
    }

    return Promise.resolve({
        dummy: new Promise<void>((resolve:() => void) => {
            void timeout(resolve)
        })
    })
}
/**
 * Asynchronous mock test method.
 * @param state - Application state.
 * @param state.services - Plugin services.
 * @param state.services.dummy - Plugin service.
 * @returns A promise resolving to nothing.
 */
export const test = (
    {services: {dummy}}:ServicePromisesState<
        undefined,
        Configuration,
        Services<{dummy:{hookCalled:boolean}}>
>):Promise<void> => {
    dummy.hookCalled = true

    return Promise.resolve()
}
/**
 * Synchronous mock test method.
 * @param state - Application state.
 * @param state.services - Plugin services.
 * @param state.services.dummy - Plugin service.
 */
export const testSynchronous = (
    {services: {dummy}}:ServicePromisesState<
        undefined,
        Configuration,
        Services<{dummy:{synchronousHookCalled:boolean}}>
    >
) => {
    dummy.synchronousHookCalled = true
}

export const Dummy = module.exports satisfies PluginHandler
export default Dummy
