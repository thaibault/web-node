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
import {Tools} from 'clientnode'

import {
    Configuration,
    PluginHandler,
    PluginPromises,
    ServicePromisesState,
    Services
} from '../type'
// endregion
/**
 * Dummy plugin implementing a test hook.
 */
export default class Dummy implements PluginHandler {
    /**
     * Loads dummy service.
     * @param this - Nothing.
     * @param state - Application state.
     * @param state.services - Plugin services.
     *
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    static loadService(this:void, {services}:ServicePromisesState):Promise<
        PluginPromises
    > {
        services.dummy = {
            hookCalled: false,
            loaded: true
        }

        return Promise.resolve({
            dummy: new Promise<void>((resolve:() => void):void => {
                void Tools.timeout(resolve)
            })
        })
    }
    /**
     * Asynchronous mock test method.
     * @param this - Nothing.
     * @param state - Application state.
     * @param state.services - Plugin services.
     * @param state.services.dummy - Plugin service.
     *
     * @returns A promise resolving to nothing.
     */
    static test(
        this:void,
        {services: {dummy}}:ServicePromisesState<
            undefined,
            Configuration,
            Services<{dummy:{hookCalled:boolean}}>
    >):Promise<
        void
    > {
        dummy.hookCalled = true

        return Promise.resolve()
    }
    /**
     * Synchronous mock test method.
     * @param this - Nothing.
     * @param state - Application state.
     * @param state.services - Plugin services.
     * @param state.services.dummy - Plugin service.
     *
     * @returns Nothing.
     */
    static testSynchronous(
        this:void,
        {services: {dummy}}:ServicePromisesState<
            undefined,
            Configuration,
            Services<{dummy:{synchronousHookCalled:boolean}}>
        >
    ):void {
        dummy.synchronousHookCalled = true
    }
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
