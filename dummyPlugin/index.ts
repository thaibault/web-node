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

import {PluginHandler, Service, ServicePromises, Services} from '../type'
// endregion
/**
 * Dummy plugin implementing a test hook.
 */
export default class Dummy implements PluginHandler {
    /**
     * Loads dummy service.
     * @param this - Nothing.
     * @param servicePromises - An intermediate object with yet stored service
     * promise instances.
     * @param services - An object with stored service instances.
     *
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    static loadService(
        this:void, servicePromises:ServicePromises, services:Services
    ):Promise<Service<void>> {
        services.dummy = {
            hookCalled: false,
            loaded: true
        }

        return Promise.resolve({
            name: 'dummy',
            promise: new Promise<void>((resolve:() => void):void => {
                void Tools.timeout(resolve)
            })
        })
    }
    /**
     * Asynchronous mock test method.
     * @param this - Nothing.
     * @param servicePromises - An intermediate object with yet stored service
     * promise instances.
     * @param services - An object with stored service instances.
     *
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    static test(
        this:void,
        servicePromises:ServicePromises,
        services:Services<{dummy:{hookCalled:boolean}}>
    ):Promise<void> {
        services.dummy.hookCalled = true

        return Promise.resolve()
    }
    /**
     * Synchronous mock test method.
     * @param this - Nothing.
     * @param servicePromises - An intermediate object with yet stored service
     * promise instances.
     * @param services - An object with stored service instances.
     *
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    static testSynchronous(
        this:void,
        servicePromises:ServicePromises,
        services:Services<{dummy:{synchronousHookCalled:boolean}}>
    ):void {
        services.dummy.synchronousHookCalled = true
    }
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
