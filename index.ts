// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module web-node */
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
import Tools, {CloseEventNames} from 'clientnode'
import {ProcedureFunction} from 'clientnode/type'

import baseConfiguration from './configurator'
import PluginAPI from './pluginAPI'
import {
    Configuration, Plugin, Service, ServicePromises, Services
} from './type'
// endregion

declare const ORIGINAL_MAIN_MODULE:object

const handleError:Function = async (
    plugins:Array<Plugin>,
    configuration:Configuration,
    error:Error,
    services:Services
):Promise<void> => {
    try {
        await PluginAPI.callStack(
            'error', plugins, configuration, error, services
        )
    } catch (error) {
        if (configuration.core.debug)
            throw error
        else
            console.error(error)
    }
}
export const main:ProcedureFunction = async ():Promise<void> => {
    // region load plugins
    const {configuration, plugins}:{
        configuration:Configuration
        plugins:Array<Plugin>
    } = await PluginAPI.loadAll(Tools.copy(baseConfiguration, -1, true))

    await PluginAPI.callStack('initialize', plugins, configuration)

    if (plugins.length)
        console.info(
            'Loaded plugins: "' +
            plugins
                .map((plugin:Plugin):string => plugin.internalName)
                .join('", "') +
            '".'
        )

    for (const type of ['pre', 'post'] as const)
        await PluginAPI.callStack(
            `${type}ConfigurationLoaded`,
            plugins,
            configuration,
            configuration,
            plugins.filter((plugin:Plugin):boolean => Boolean(
                plugin.configurationFilePaths.length
            ))
        )
    // endregion
    let services:Services = {}
    let servicePromises:ServicePromises = {}
    let exitTriggered = false
    try {
        // region start services
        services = await PluginAPI.callStack(
            'preLoadService', plugins, configuration, services
        )

        for (const name in services)
            if (Object.prototype.hasOwnProperty.call(services, name))
                console.info(`Service "${name}" initialized.`)

        for (const plugin of plugins)
            if (plugin.api) {
                services = await PluginAPI.callStack(
                    `preLoad${Tools.stringCapitalize(plugin.internalName)}` +
                        'Service',
                    plugins,
                    configuration,
                    services
                )

                let result:null|Service = null
                try {
                    result = await plugin.api.call(
                        PluginAPI,
                        'loadService',
                        servicePromises,
                        services,
                        configuration,
                        plugins
                    )
                } catch (error) {
                    if (!(error as Error)?.message?.startsWith(
                        'NotImplemented:'
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

                if (typeof result?.name === 'string')
                    if (
                        result.promise !== null &&
                        typeof result.promise === 'object' &&
                        'then' in result.promise
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
        let finished = false
        const closeHandler = ():void => {
            if (!finished)
                PluginAPI.callStackSynchronous(
                    'exit',
                    plugins.slice().reverse(),
                    configuration,
                    services
                )
            finished = true
        }
        for (const closeEventName of CloseEventNames)
            process.on(closeEventName, closeHandler)

        let cancelTriggered = false

        process.stdin.setRawMode(true)
        process.stdin.resume()
        process.stdin.setEncoding(configuration.core.encoding)
        process.stdin.on('data', (key:string):void => {
            void (async ():Promise<void> => {
                if (key === '\u0003') {
                    if (cancelTriggered)
                        console.warn('Stopping ungracefully.')
                    else {
                        cancelTriggered = true

                        console.info(
                            'You have requested to shut down all services. A' +
                            ' second request will force to stop ungracefully.'
                        )

                        await PluginAPI.callStack(
                            'shouldExit', plugins, configuration, services
                        )
                    }

                    process.exit()
                }

                process.stdout.write(key)
            })()
        })
        // endregion
        try {
            await Promise.all(
                Object.keys(servicePromises).map((name:string):object =>
                    servicePromises[name]
                )
            )
        } catch (error) {
            // Ignore error.
        }

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
        if (configuration.core.debug)
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
    void main()

export default main
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
