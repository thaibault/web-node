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
import {PluginAPI} from '../pluginAPI'
// endregion
/**
 * Dummy plugin implementing a test hook.
 */
export default class Dummy implements PluginHandler {
    static loadService(
        this:PluginAPI, servicePromises:ServicePromises, services:Services
    ):Promise<Service> {
        services.dummy = {
            hookCalled: false,
            loaded: true
        }
        return Promise.resolve({
            name: 'dummy',
            promise: new Promise((resolve:Function):void =>
                Tools.timeout(resolve)
            )
        })
    }

    static test(
        this:PluginAPI, servicePromises:ServicePromises, services:Services
    ):Promise<void> {
        services.dummy.hookCalled = true
        return Promise.resolve()
    }

    static testSynchronous(
        this:PluginAPI, servicePromises:ServicePromises, services:Services
    ):void {
        services.dummy.synchronousHookCalled = true
    }
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
