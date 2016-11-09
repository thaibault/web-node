// @flow
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons naming
    3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import Tools from 'clientnode'
import type {ProcedureFunction} from 'clientnode'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import keypress from 'keypress'

import baseConfiguration from './configurator'
import PluginAPI from './pluginAPI'
import type {Configuration, Plugin, Services} from './type'
// endregion
const main:ProcedureFunction = async ():Promise<any> => {
    // region load plugins
    const {configuration, plugins}:{
        configuration:Configuration;
        plugins:Array<Plugin>;
    } = await PluginAPI.loadAll(Tools.copyLimitedRecursively(
        baseConfiguration, -1, null, true))
    await PluginAPI.callStack('initialize', plugins, configuration)
    if (plugins.length)
        console.info(
            'Loaded plugins: "' + plugins.map((plugin:Object):string =>
                plugin.internalName
            ).join('", "') + '".')
    for (const type:string of ['pre', 'post'])
        await PluginAPI.callStack(
            `${type}ConfigurationLoaded`, plugins, configuration,
            configuration, plugins.filter((plugin:Plugin):boolean =>
                Boolean(plugin.configurationFilePath)))
    // endregion
    let services:Services = {}
    let servicePromises:{[key:string]:Promise<Object>} = {}
    try {
        // region start services
        services = await PluginAPI.callStack(
            `preLoadService`, plugins, configuration, services)
        for (const serviceName:string in services)
            if (services.hasOwnProperty(serviceName)) {
                console.info(`Load service ${serviceName}.`)
                for (const plugin:Plugin of plugins)
                    if (plugin.api) {
                        const result:any = plugin.api.call(
                            PluginAPI, 'loadService', null, services,
                            configuration, plugins)
                        if (
                            typeof result === 'object' && result !== null &&
                            'then' in result
                        )
                            servicePromises[serviceName] = result
                    }
            }
        servicePromises = await PluginAPI.callStack(
            `postLoadService`, plugins, configuration, servicePromises,
            services)
        // endregion
        // region register close handler
        let finished:boolean = false
        const closeHandler:Function = ():void => {
            if (!finished)
                try {
                    PluginAPI.callStackSynchronous(
                        'exit', plugins.slice().reverse(), configuration,
                        services)
                } catch (error) {
                    throw error
                }
            finished = true
        }
        for (const closeEventName:string of Tools.closeEventNames)
            process.on(closeEventName, closeHandler)
        // NOTE: Make "process.stdin" begin emitting events for any key press.
        keypress(process.stdin)
        process.stdin.on('keypress', async (
            char:number, key:Object
        ):Promise<void> => {
            if (key && key.name === 'c' && key.ctrl) {
                await PluginAPI.callStack(
                    'shouldExit', plugins.slice().reverse(), configuration,
                    services)
                process.exit(255)
            }
        })
        await Promise.all(servicePromises)
        await PluginAPI.callStack(
            'shouldExit', plugins.slice().reverse(), configuration, services)
        // endregion
    } catch (error) {
        try {
            await PluginAPI.callStack(
                'error', plugins, configuration, error, services)
        } catch (error) {
            if (configuration.debug)
                throw error
            else
                console.error(error)
        }
        if (configuration.debug)
            throw error
        else
            console.error(error)
    }
}
/* eslint-disable camelcase */
// IgnoreTypeCheck
if (require.main === module || typeof __webpack_require__ !== 'undefined')
/* eslint-enable camelcase */
    main()
export default main
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
