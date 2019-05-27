// @flow
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    [Project page](https://torben.website/webNode)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
export * from './configurator'
export * from './pluginAPI'
// region imports
import Tools from 'clientnode'
import type {ProcedureFunction} from 'clientnode'
import keypress from 'keypress'

import baseConfiguration from './configurator'
import PluginAPI from './pluginAPI'
import type {Configuration, Plugin, ServicePromises, Services} from './type'
// endregion
declare var ORIGINAL_MAIN_MODULE:Object
const handleError:Function = async (
    plugins:Array<Plugin>,
    configuration:Configuration,
    error:Error,
    services:Services
):Promise<void> => {
    try {
        await PluginAPI.callStack(
            'error', plugins, configuration, error, services)
    } catch (error) {
        if (configuration.debug)
            throw error
        else
            console.error(error)
    }
}
const main:ProcedureFunction = async ():Promise<void> => {
    // region load plugins
    const {configuration, plugins}:{
        configuration:Configuration;
        plugins:Array<Plugin>;
    } = await PluginAPI.loadAll(Tools.copy(baseConfiguration, -1, true))
    await PluginAPI.callStack('initialize', plugins, configuration)
    if (plugins.length)
        console.info(
            'Loaded plugins: "' + plugins.map((plugin:Object):string =>
                plugin.internalName
            ).join('", "') + '".')
    for (const type:string of ['pre', 'post'])
        await PluginAPI.callStack(
            `${type}ConfigurationLoaded`,
            plugins,
            configuration,
            configuration,
            plugins.filter((plugin:Plugin):boolean => Boolean(
                plugin.configurationFilePath
            ))
        )
    // endregion
    let services:Services = {}
    let servicePromises:ServicePromises = {}
    let exitTriggered:boolean = false
    try {
        // region start services
        services = await PluginAPI.callStack(
            'preLoadService', plugins, configuration, services)
        for (const name:string in services)
            if (services.hasOwnProperty(name))
                console.info(`Service "${name}" initialized.`)
        for (const plugin:Plugin of plugins)
            if (plugin.api) {
                services = await PluginAPI.callStack(
                    `preLoad${Tools.stringCapitalize(plugin.internalName)}` +
                        'Service',
                    plugins,
                    configuration,
                    services
                )
                let result:any
                try {
                    // IgnoreTypeCheck
                    result = await plugin.api.call(
                        PluginAPI,
                        'loadService',
                        servicePromises,
                        services,
                        configuration,
                        plugins
                    )
                } catch (error) {
                    if (!(
                        typeof error === 'object' &&
                        error !== null &&
                        'message' in error &&
                        error.message.startsWith('NotImplemented:')
                    ))
                        throw new Error(
                            `Plugin "${plugin.internalName}" ` +
                            (
                                (plugin.internalName === plugin.name) ?
                                    '' :
                                    `(${plugin.name}) `
                            ) +
                            `throws: ${Tools.represent(error)} ` +
                            'during asynchrone hook "loadService".'
                        )
                }
                if (
                    result &&
                    result.hasOwnProperty('name') &&
                    typeof result.name === 'string'
                )
                    if (
                        result.hasOwnProperty('promise') &&
                        typeof result.promise === 'object' &&
                        result.promise !== null && 'then' in result.promise
                    ) {
                        console.info(`Service "${result.name}" started.`)
                        servicePromises[result.name] = result.promise
                    } else
                        console.info(`Service "${result.name}" loaded.`)
                services = await PluginAPI.callStack(
                    `postLoad${Tools.stringCapitalize(plugin.internalName)}` +
                        'Service',
                    plugins,
                    configuration,
                    services,
                    servicePromises
                )
            }
        servicePromises = await PluginAPI.callStack(
            'postLoadService',
            plugins,
            configuration,
            servicePromises,
            services
        )
        // endregion
        // region register close handler
        let finished:boolean = false
        const closeHandler:Function = ():void => {
            if (!finished)
                PluginAPI.callStackSynchronous(
                    'exit',
                    plugins.slice().reverse(),
                    configuration,
                    services
                )
            finished = true
        }
        for (const closeEventName:string of Tools.closeEventNames)
            process.on(closeEventName, closeHandler)
        // NOTE: Make "process.stdin" begin emitting events for any key press.
        keypress(process.stdin)
        let cancelTriggered:boolean = false
        process.stdin.on('keypress', async (
            char:number, key:Object
        ):Promise<void> => {
            if (key && key.name === 'c' && key.ctrl) {
                if (cancelTriggered)
                    console.warn('Stopping ungracefully.')
                else {
                    cancelTriggered = true
                    console.log(
                        'You have requested to shut down all services. A ' +
                        'second request will force to stop ungracefully.')
                    await PluginAPI.callStack(
                        'shouldExit', plugins, configuration, services)
                }
                process.exit()
            }
        })
        if ('setRawMode' in process.stdin)
            // IgnoreTypeCheck
            process.stdin.setRawMode(true)
        // endregion
        try {
            await Promise.all(Object.keys(servicePromises).map((
                name:string
            ):Object => servicePromises[name]))
        } catch (error) {}
        exitTriggered = true
        await PluginAPI.callStack(
            'shouldExit', plugins, configuration, services
        )
        process.exit()
    } catch (error) {
        handleError(plugins, configuration, error, services)
        if (!exitTriggered)
            try {
                await PluginAPI.callStack(
                    'shouldExit', plugins, configuration, services
                )
            } catch (error) {
                handleError(plugins, configuration, error, services)
            }
        if (configuration.debug)
            throw error
        else
            console.error(error)
        process.exit(1)
    }
}
if (
    require.main === module ||
    eval('require.main') !== require.main &&
    typeof ORIGINAL_MAIN_MODULE !== 'undefined' &&
    ORIGINAL_MAIN_MODULE === eval('require.main')
)
    main()
export default main
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
