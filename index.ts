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
import {
    capitalize, copy, CLOSE_EVENT_NAMES, isFunction, represent
} from 'clientnode'

import baseConfiguration from './configurator'
import pluginAPI, {callStack, callStackSynchronous, loadAll} from './pluginAPI'
import {
    APIFunction,
    BaseState,
    ChangedConfigurationState,
    Configuration,
    Plugin,
    PluginPromises,
    ServicePromises,
    ServicePromisesState,
    Services,
    ServicesState
} from './type'
// endregion

declare const ORIGINAL_MAIN_MODULE:object

const handleError = async (
    state:Omit<ServicePromisesState<Error>, 'hook'|'pluginAPI'>
):Promise<void> => {
    try {
        await callStack<ServicePromisesState<Error>>(
            {...state, hook: 'error'}
        )
    } catch (error) {
        if (state.configuration.core.debug)
            throw error
        else
            console.error(error)
    }
}
export const main = async ():Promise<void> => {
    // region load plugins
    const {configuration, plugins}:{
        configuration:Configuration
        plugins:Array<Plugin>
    } = await loadAll(copy(baseConfiguration))

    await callStack<BaseState>({configuration, hook: 'initialize', plugins})

    if (plugins.length)
        console.info(
            'Loaded plugins: "' +
            plugins
                .map((plugin:Plugin):string => plugin.internalName)
                .join('", "') +
            '".'
        )

    const pluginsWithChangedConfiguration:Array<Plugin> =
        plugins.filter((plugin:Plugin):boolean => Boolean(
            plugin.configurationFilePaths.length
        ))
    for (const type of ['pre', 'post'] as const)
        await callStack<ChangedConfigurationState>({
            configuration,
            hook: `${type}ConfigurationLoaded`,
            plugins,
            pluginsWithChangedConfiguration
        })
    // endregion
    const services:Services = {}
    const servicePromises:ServicePromises = {}
    let exitTriggered = false
    try {
        // region start services
        await callStack<ServicesState>({
            configuration,
            hook: 'preLoadService',
            plugins,
            services
        })

        for (const name of Object.keys(services))
            console.info(`Service "${name}" initialized.`)

        for (const plugin of plugins)
            if (plugin.api) {
                await callStack<ServicesState>({
                    configuration,
                    hook: `preLoad${capitalize(plugin.internalName)}Service`,
                    plugins,
                    services
                })

                let result:null|PluginPromises = null
                try {
                    result = await (plugin.api as APIFunction<
                        Promise<null|PluginPromises>
                    >)({
                        configuration,
                        hook: 'loadService',
                        pluginAPI,
                        plugins,
                        servicePromises,
                        services
                    })
                } catch (error) {
                    if (!(error as {message?:string}|null)?.message?.startsWith(
                        'NotImplemented:'
                    ))
                        throw new Error(
                            `Plugin "${plugin.internalName}" ` +
                            (
                                (plugin.internalName === plugin.name) ?
                                    '' :
                                    `(${plugin.name}) `
                            ) +
                            `throws: ${represent(error)} 'during asynchrone ` +
                            'hook "loadService".'
                        )
                }

                if (result)
                    for (const [name, promise] of Object.entries(result))
                        if (
                            promise !== null &&
                            typeof promise === 'object' &&
                            'then' in promise
                        ) {
                            console.info(`Service "${name}" started.`)

                            servicePromises[name] = promise
                        } else
                            console.info(`Service "${name}" loaded.`)

                await callStack({
                    configuration,
                    hook: `postLoad${capitalize(plugin.internalName)}Service`,
                    plugins,
                    services,
                    servicePromises
                })
            }

        await callStack({
            configuration,
            hook: 'postLoadService',
            plugins,
            servicePromises,
            services
        })
        // endregion
        // region register close handler
        let finished = false
        const closeHandler = ():void => {
            if (!finished)
                callStackSynchronous({
                    configuration,
                    hook: 'exit',
                    plugins: plugins.slice().reverse(),
                    servicePromises,
                    services
                })

            finished = true
        }
        for (const closeEventName of CLOSE_EVENT_NAMES)
            process.on(closeEventName, closeHandler)

        let cancelTriggered = false

        /*
            NOTE: "setRawMode" is only available when the input is provided by
            a TTY and not as direct stream from stdin.

            NOTE: Access property via string to avoid lint error
            "@typescript-eslint/unbound-method".
        */
        if (isFunction(process.stdin['setRawMode']))
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

                        await callStack({
                            configuration,
                            hook: 'shouldExit',
                            plugins,
                            servicePromises,
                            services
                        })
                    }

                    process.exit()
                }

                process.stdout.write(key)
            })()
        })
        // endregion
        try {
            await Promise.all(
                Object.keys(servicePromises)
                    .map((name:string):Promise<unknown> =>
                        servicePromises[name]
                    )
            )
        } catch (_error) {
            // Ignore error.
        }

        exitTriggered = true

        await callStack({
            configuration,
            hook: 'shouldExit',
            plugins,
            servicePromises,
            services
        })

        process.exit()
    } catch (error) {
        await handleError({
            configuration,
            data: error as Error,
            plugins,
            servicePromises,
            services
        })

        if (!exitTriggered)
            try {
                await callStack({
                    configuration,
                    hook: 'shouldExit',
                    plugins,
                    servicePromises,
                    services
                })
            } catch (error) {
                await handleError({
                    configuration,
                    data: error as Error,
                    plugins,
                    servicePromises,
                    services
                })
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
