// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module pluginAPI */
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
import {
    spawnSync as spawnChildProcessSync, SpawnSyncReturns
} from 'child_process'
import Tools from 'clientnode'
import {
    Encoding, Mapping, RecursiveEvaluateable, ValueOf
} from 'clientnode/type'
import fileSystem, {readdirSync, statSync} from 'fs'
import {Module} from 'module'
import path, {basename, extname, join, resolve} from 'path'

import baseConfiguration from './configurator'
import {
    Configuration,
    EvaluateablePartialConfiguration,
    MetaPluginConfiguration,
    PackageConfiguration,
    Plugin,
    PluginChange,
    PluginConfiguration
} from './type'
// endregion
// region allow plugins to import "web-node" as already loaded main module
type ModuleType =
    typeof Module &
    {
        _resolveFilename:(
            _request:string, _module:typeof Module, _isMain:boolean
        ) => string
    }
const oldResolveFilename = (Module as ModuleType)._resolveFilename
;(Module as ModuleType)._resolveFilename = (
    request:string, parent:typeof Module, isMain:boolean
):string => {
    if (request === 'web-node')
        return oldResolveFilename(
            eval('require.main.id') as string,
            parent,
            isMain
        )

    return oldResolveFilename(request, parent, isMain)
}
// endregion
/**
 * A dumm plugin interface with all available hooks.
 */
export class PluginAPI {
    /**
     * Calls all plugin methods for given trigger description asynchronous and
     * waits for their resolved promises.
     * @param hook - Type of trigger.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param configuration - Plugin extendable configuration object.
     * @param data - Data to pipe throw all plugins and resolve after all
     * plugins have been resolved.
     * @param parameters - Additional parameters to forward into plugin api.
     *
     * @returns A promise which resolves when all callbacks have resolved their
     * promise holding given potentially modified data.
     */
    static async callStack(
        hook:string,
        plugins:Array<Plugin>,
        configuration:Configuration,
        data:any = null,
        ...parameters:Array<any>
    ):Promise<any> {
        if (configuration.core.plugin.hotReloading) {
            const pluginsWithChangedConfiguration:Array<Plugin> =
                PluginAPI.hotReloadConfigurationFile(
                    plugins,
                    configuration.core.plugin.configuration.propertyNames
                )

            if (pluginsWithChangedConfiguration.length) {
                if (configuration.core.debug)
                    console.info(
                        'Configuration for "' +
                        pluginsWithChangedConfiguration
                            .map((plugin:Plugin):string => plugin.name)
                            .join('", "') +
                        '" has been changed: reloading initialized.'
                    )

                await PluginAPI.callStack(
                    'preConfigurationLoaded',
                    plugins,
                    configuration,
                    configuration,
                    pluginsWithChangedConfiguration
                )

                PluginAPI.loadConfigurations(plugins, configuration)

                await PluginAPI.callStack(
                    'postConfigurationLoaded',
                    plugins,
                    configuration,
                    configuration,
                    pluginsWithChangedConfiguration
                )
            }

            const pluginsWithChangedAPIFiles:Array<Plugin> =
                PluginAPI.hotReloadAPIFile(plugins)

            if (pluginsWithChangedAPIFiles.length) {
                if (configuration.core.debug)
                    console.info(
                        'API-file for "' +
                        `${pluginsWithChangedAPIFiles.map((
                            plugin:Plugin
                        ):string => plugin.name).join('", "')}" ` +
                        'has been changed: reloading initialized.'
                    )

                await PluginAPI.callStack(
                    'apiFileReloaded',
                    plugins,
                    configuration,
                    pluginsWithChangedAPIFiles
                )
            }
        }

        for (const plugin of plugins)
            if (plugin.api) {
                let result:any
                try {
                    result = await plugin.api(
                        hook,
                        data,
                        ...parameters.concat(
                            hook.endsWith('ConfigurationLoaded') ?
                                [] :
                                configuration,
                            /*
                                NOTE: We have to wrap into an array here to
                                avoid spreading the plugins array.
                            */
                            [plugins]
                        )
                    )
                } catch (error) {
                    if (
                        (error as Error).message?.startsWith('NotImplemented:')
                    )
                        continue

                    throw new Error(
                        `Plugin "${plugin.internalName}" ` +
                        (
                            (plugin.internalName === plugin.name) ?
                                '' :
                                `(${plugin.name}) `
                        ) +
                        `throws: ${Tools.represent(error)} during ` +
                        `asynchronous hook "${hook}".`
                    )
                }

                data = result

                if (configuration.core.debug)
                    console.info(
                        `Ran asynchronous hook "${hook}" for plugin "` +
                        `${plugin.name}".`
                    )
            }

        return data
    }
    /**
     * Calls all plugin methods for given trigger description synchronous.
     * @param hook - Hook to trigger.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param configuration - Plugin extendable configuration object.
     * @param data - Data to pipe throw all plugins and resolve after all
     * plugins have been resolved.
     * @param parameters - Additional parameters to forward into plugin api.
     *
     * @returns Given potentially modified data.
     */
    static callStackSynchronous(
        hook:string,
        plugins:Array<Plugin>,
        configuration:Configuration,
        data:any = null,
        ...parameters:Array<any>
    ):any {
        for (const plugin of plugins)
            if (plugin.api) {
                let result:any
                try {
                    result = plugin.api(
                        hook,
                        data,
                        ...parameters.concat(configuration, plugins)
                    )
                } catch (error) {
                    if ((error as Error).message?.startsWith(
                        'NotImplemented:'
                    ))
                        continue

                    throw new Error(
                        `Plugin "${plugin.internalName}" ` +
                        (
                            (plugin.internalName === plugin.name) ?
                                '' :
                                `(${plugin.name}) `
                        ) +
                        `throws: ${Tools.represent(error)} during ` +
                        `synchronous hook "${hook}".`
                    )
                }

                data = result

                if (configuration.core.debug)
                    console.info(
                        `Ran synchronous hook "${hook}" for plugin "` +
                        `${plugin.name}".`
                    )
            }

        return data
    }
    /**
     * Evaluates given configuration object by letting plugins package sub
     * structure untouched.
     * @param configuration - Evaluateable configuration structure.
     *
     * @returns Resolved configuration.
     */
    static evaluateConfiguration(
        configuration:RecursiveEvaluateable<Configuration>
    ):Configuration {
        /*
            NOTE: We have to backup, remove and restore all plugin specific
            package configuration to avoid evaluation non web node#
            configuration structures.
        */
        const pluginPackageConfigurationBackup:Mapping<PackageConfiguration> =
            {}
        for (const [name, subConfiguration] of Object.entries(configuration))
            if ((subConfiguration as PluginConfiguration).package) {
                pluginPackageConfigurationBackup[name] =
                    (subConfiguration as PluginConfiguration).package
                delete (subConfiguration as Partial<PluginConfiguration>)
                    .package
            }

        const now:Date = new Date()

        configuration = Tools.evaluateDynamicData<Configuration>(
            Tools.removeKeysInEvaluation(configuration),
            {
                currentPath: process.cwd(),
                fileSystem,
                path,
                PluginAPI,
                /* eslint-disable no-eval */
                require: eval('require'),
                /* eslint-enable no-eval */
                Tools,
                webNodePath: __dirname,
                now,
                nowUTCTimestamp: Tools.numberGetUTCTimestamp(now)
            }
        )

        for (const [name, pluginPackageConfiguration] of Object.entries(
            pluginPackageConfigurationBackup
        ))
            (configuration[name] as PluginConfiguration).package =
                pluginPackageConfiguration

        return configuration as Configuration
    }
    /**
     * Checks for changed plugin api file in given plugins and reloads them
     * if necessary (new timestamp).
     * @param plugins - List of plugins to search for updates in.
     *
     * @returns A list with plugins which have a changed api scope.
     */
    static hotReloadAPIFile(plugins:Array<Plugin>):Array<Plugin> {
        const pluginsWithChangedFiles:Array<Plugin> = []
        const pluginChanges:Array<PluginChange> =
            PluginAPI.hotReloadFiles('api', 'scope', plugins)

        for (const pluginChange of pluginChanges) {
            // NOTE: We have to migrate old plugin api's scope state.
            for (const name in pluginChange.oldScope)
                if (
                    Object.prototype.hasOwnProperty.call(
                        pluginChange.oldScope, name
                    ) &&
                    Object.prototype.hasOwnProperty.call(
                        pluginChange.newScope, name
                    ) &&
                    !(
                        Tools.isFunction((
                            pluginChange.oldScope as Mapping<unknown>
                        )[name]) ||
                        Tools.isFunction((
                            pluginChange.newScope as Mapping<unknown>
                        )[name])
                    )
                )
                    (pluginChange.newScope as Mapping<unknown>) =
                        pluginChange.oldScope as Mapping<unknown>

            pluginsWithChangedFiles.push(pluginChange.plugin)
        }

        return pluginsWithChangedFiles
    }
    /**
     * Checks for changed plugin configurations in given plugins and reloads
     * them if necessary (new timestamp).
     * @param plugins - List of plugins to search for updates in.
     * @param configurationPropertyNames - Property names to search for to use
     * as entry in plugin configuration file.
     *
     * @returns A list with plugins which have a changed configurations.
     */
    static hotReloadConfigurationFile(
        plugins:Array<Plugin>, configurationPropertyNames:Array<string>
    ):Array<Plugin> {
        const pluginsWithChangedFiles:Array<Plugin> = []
        const pluginChanges:Array<PluginChange> = PluginAPI.hotReloadFiles(
            'configuration', 'packageConfiguration', plugins
        )

        for (const change of pluginChanges) {
            change.plugin.configuration = PluginAPI.loadConfiguration(
                change.plugin.internalName,
                change.plugin.packageConfiguration,
                configurationPropertyNames
            )
            pluginsWithChangedFiles.push(change.plugin)
        }

        return pluginsWithChangedFiles
    }
    /**
     * Checks for changed plugin file type in given plugins and reloads them
     * if necessary (timestamp has changed).
     * @param type - Plugin file type to search for updates.
     * @param target - Property name existing in plugin meta informations
     * objects which should be updated.
     * @param plugins - List of plugins to search for updates in.
     *
     * @returns A list with plugin changes.
     */
    static hotReloadFiles(
        type:'api'|'configuration',
        target:'packageConfiguration'|'scope',
        plugins:Array<Plugin>
    ):Array<PluginChange> {
        const pluginChanges:Array<PluginChange> = []
        for (const plugin of plugins)
            if (plugin[target]) {
                let index = 0

                for (const filePath of plugin[`${type}FilePaths`]) {
                    const timestamp:number = statSync(filePath).mtime.getTime()

                    if (
                        plugin[`${type}FileLoadTimestamps`][index] < timestamp
                    ) {
                        // Enforce to reload new file version.
                        /* eslint-disable no-eval */
                        delete (eval('require').cache as Mapping<unknown>)[
                            eval('require').resolve(filePath) as string
                        ]
                        /* eslint-enable no-eval */

                        const oldScope:ValueOf<Plugin> = plugin[target]

                        plugin[target] = PluginAPI.loadFile(
                            filePath, plugin.name, plugin[target]
                        ) as object|PackageConfiguration

                        pluginChanges.push({
                            newScope: plugin[target] as object,
                            oldScope,
                            plugin,
                            target
                        })
                    }

                    plugin[`${type}FileLoadTimestamps`][index] = timestamp

                    index += 1
                }
            }

        return pluginChanges
    }
    /**
     * Extends given configuration object with given plugin specific ones and
     * returns a plugin specific meta information object.
     * @param name - Name of plugin to extend.
     * @param internalName - Internal name of plugin to extend.
     * @param plugins - List of all yet determined plugin informations.
     * @param metaConfiguration - Configuration file configuration.
     * @param pluginPath - Path to given plugin.
     * @param encoding - Encoding to use to read and write from child
     * process's.
     *
     * @returns An object of plugin specific meta informations.
     */
    static async load(
        name:string,
        internalName:string,
        plugins:Mapping<Plugin>,
        metaConfiguration:MetaPluginConfiguration,
        pluginPath:string,
        encoding:Encoding = 'utf8'
    ):Promise<Plugin> {
        const configurationFilePaths:Array<string> = []
        const packageConfiguration:PackageConfiguration = {}

        for (const fileName of metaConfiguration.fileNames) {
            const filePath:string = resolve(pluginPath, fileName)

            if (await Tools.isFile(filePath)) {
                Tools.extend(
                    true,
                    packageConfiguration,
                    PluginAPI.loadFile(filePath, name)
                )
                configurationFilePaths.push(filePath)
            }
        }

        const apiFilePaths:Array<string> = ['index.js']

        if (Object.keys(packageConfiguration).length) {
            const configuration:EvaluateablePartialConfiguration =
                PluginAPI.loadConfiguration(
                    name, packageConfiguration, metaConfiguration.propertyNames
                )

            if (configuration[name].package.main)
                apiFilePaths[0] = configuration[name].package.main!

            return await PluginAPI.loadAPI(
                apiFilePaths,
                pluginPath,
                name,
                internalName,
                plugins,
                encoding,
                configuration,
                configurationFilePaths
            )
        }

        return await PluginAPI.loadAPI(
            apiFilePaths, pluginPath, name, internalName, plugins, encoding
        )
    }
    /**
     * Load given plugin api file in given path and generates a plugin
     * specific data structure with useful meta informations.
     * @param relativeFilePaths - Paths to file to load relatively from given
     * plugin path.
     * @param pluginPath - Path to plugin directory.
     * @param name - Plugin name to use for proper error messages.
     * @param internalName - Internal plugin name to use for proper error
     * messages.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param encoding - Encoding to use to read and write from child
     * process.
     * @param configuration - Plugin specific configurations.
     * @param configurationFilePaths - Plugin specific configuration file
     * paths.
     *
     * @returns Plugin meta informations object.
     */
    static async loadAPI(
        relativeFilePaths:Array<string>,
        pluginPath:string,
        name:string,
        internalName:string,
        plugins:Mapping<Plugin>,
        encoding:Encoding = 'utf8',
        configuration:null|EvaluateablePartialConfiguration = null,
        configurationFilePaths:Array<string> = []
    ):Promise<Plugin> {
        let filePath:string = resolve(pluginPath, relativeFilePaths[0])
        if (!(await Tools.isFile(filePath)))
            // Determine entry file if given one does not exist.
            for (const fileName of readdirSync(pluginPath))
                if (
                    !configurationFilePaths.map((filePath:string):string =>
                        basename(filePath)
                    ).includes(fileName) &&
                    await Tools.isFile(resolve(pluginPath, fileName))
                ) {
                    filePath = resolve(pluginPath, filePath)

                    if (['index', 'main'].includes(
                        basename(filePath, extname(fileName))
                    ))
                        break
                }

        let api:Function|null = null
        let nativeAPI = false

        /*
            NOTE: We only want to register api's for web node plugins. Others
            doesn't have a package configuration file with specified "webNode"
            like key in it.
        */
        if (
            configuration &&
            Object.keys(configuration).length > 1 &&
            await Tools.isFile(filePath)
        )
            if (filePath.endsWith('.js')) {
                nativeAPI = true
                api = (
                    hook:string, data:any, ...parameters:Array<any>
                ):any => {
                    if (hook in plugins[name].scope!)
                        return (
                            plugins[name].scope as Mapping<Function>
                        )[hook](data, ...parameters, PluginAPI)

                    throw new Error(
                        `NotImplemented: API method "${hook}" is not ` +
                        `implemented in plugin "${name}".`
                    )
                }
            } else
                // NOTE: Any executable file can represent an api.
                api = (data:any, ...parameters:Array<any>):any => {
                    const childProcessResult:SpawnSyncReturns<string> =
                        spawnChildProcessSync(
                            filePath,
                            Tools.arrayMake(parameters),
                            {
                                cwd: process.cwd(),
                                encoding,
                                env: process.env,
                                input: Tools.represent(data),
                                shell: true,
                                stdio: 'inherit'
                            }
                        )
                    if (
                        childProcessResult.stdout.startsWith('##') &&
                        childProcessResult.stdout.endsWith('##')
                    )
                        data = JSON.parse(data)

                    // TODO check if method wasn't implemented by special
                    // returnCode
                    return data
                }

        const pluginConfiguration:EvaluateablePartialConfiguration =
            configuration ?? {[internalName]: {package: {}}}

        return {
            api,
            apiFilePaths: api ? [filePath] : [],
            apiFileLoadTimestamps:
                api ? [statSync(filePath).mtime.getTime()] : [],
            configuration: pluginConfiguration,
            configurationFilePaths,
            configurationFileLoadTimestamps:
                configurationFilePaths.map((filePath:string):number =>
                    statSync(filePath).mtime.getTime()
                ),
            dependencies:
                pluginConfiguration[internalName]?.dependencies || [],
            internalName,
            name,
            packageConfiguration: pluginConfiguration[internalName]?.package,
            path: pluginPath,
            scope: nativeAPI ? PluginAPI.loadFile(filePath, name) : null
        }
    }
    /**
     * Loads plugin specific configuration object.
     * @param name - Property name where to inject resolved configuration into
     * global one.
     * @param packageConfiguration - Plugin specific package configuration
     * object.
     * @param configurationPropertyNames - Property names to search for to use
     * as entry in plugin configuration file.
     *
     * @returns Determined configuration object.
     */
    static loadConfiguration(
        name:string,
        packageConfiguration:PackageConfiguration,
        configurationPropertyNames:Array<string>
    ):EvaluateablePartialConfiguration {
        /*
            No plugin specific configuration found. Only provide package
            configuration.
            Removing comments (default key prefix to delete is "#").
        */
        const packageConfigurationCopy:PackageConfiguration =
            Tools.removeKeyPrefixes(Tools.copy(packageConfiguration, -1, true))

        const result:EvaluateablePartialConfiguration = {
            [name]: {package: packageConfigurationCopy}
        }

        for (const propertyName of configurationPropertyNames)
            if (packageConfiguration[propertyName as 'webNode']) {
                Tools.extend(
                    true,
                    result,
                    packageConfiguration[propertyName as 'webNode']!
                )

                /*
                    NOTE: We should break the cycle here to avoid endless loops
                    when traversing this data structure.
                */
                delete result[name].package[propertyName as 'webNode']

                break
            }

        return result
    }
    /**
     * Loads given plugin configurations into global configuration.
     * @param plugins - Topological sorted list of plugins to check for
     * configurations.
     * @param configuration - Global configuration to extend with.
     *
     * @returns Updated given configuration object.
     */
    static loadConfigurations(
        plugins:Array<Plugin>, configuration:Configuration
    ):Configuration {
        /*
            First clear current configuration content key by key to let old top
            level configuration reference in usable.
        */
        for (const key in configuration)
            if (Object.prototype.hasOwnProperty.call(configuration, key))
                delete configuration[key]

        Tools.extend(configuration, Tools.copy(baseConfiguration, -1, true))
        for (const plugin of plugins)
            if (plugin.configuration) {
                const pluginConfiguration:EvaluateablePartialConfiguration =
                    Tools.copy(plugin.configuration, -1, true)

                Tools.extend<Configuration>(
                    true,
                    Tools.modifyObject<Configuration>(
                        configuration, pluginConfiguration
                    )!,
                    /*
                        NOTE: Should be resolved via preceding
                        "Tools.modifyObject" call.
                    */
                    pluginConfiguration as Configuration
                )

                /*
                    NOTE: We apply provided runtime configuration after each
                    plugin specific configuration set to given runtime
                    configuration always the highest priority when resolving#
                    intermediate configuration states.
                */
                if (configuration.core.runtimeConfiguration)
                    Tools.extend<Configuration>(
                        true,
                        configuration,
                        configuration.core.runtimeConfiguration as
                            Configuration
                    )
            }

        return PluginAPI.evaluateConfiguration(
            configuration as RecursiveEvaluateable<Configuration>
        )
    }
    /**
     * Load given api file path and returns exported scope.
     * @param filePath - Path to file to load.
     * @param name - Plugin name to use for proper error messages.
     * @param fallbackScope - Scope to return if an error occurs during
     * loading. If a "null" is given an error will be thrown.
     * @param log - Enables logging.
     *
     * @returns Exported api file scope.
     */
    static loadFile(
        filePath:string,
        name:string,
        fallbackScope:null|object = null,
        log = true
    ):object {
        let reference:string|undefined
        try {
            /* eslint-disable no-eval */
            reference = eval('require').resolve(filePath)
            /* eslint-enable no-eval */
        } catch (error) {
            // Ignore error.
        }

        // Clear module cache to get actual new module scope.
        if (reference && reference in eval('require').cache)
            /* eslint-disable no-eval */
            delete eval('require').cache[reference]
            /* eslint-enable no-eval */

        let scope:object
        try {
            /* eslint-disable no-eval */
            scope = eval('require')(filePath)
            /* eslint-enable no-eval */
        } catch (error) {
            if (fallbackScope) {
                scope = fallbackScope

                if (log)
                    console.warn(
                        `Couln't load new api plugin file "${filePath}" for ` +
                        `plugin "${name}": ${Tools.represent(error)}. Using ` +
                        'fallback one.'
                    )
            } else
                throw new Error(
                    `Couln't load plugin file "${filePath}" for plugin "` +
                    `${name}": ${Tools.represent(error)}`
                )
        }

        if (Object.prototype.hasOwnProperty.call(scope, 'default'))
            return (scope as {default:object}).default

        return scope
    }
    /**
     * Extends given configuration object with all plugin specific ones and
     * returns a topological sorted list of plugins with plugins specific
     * meta informations stored.
     * @param configuration - Configuration object to extend and use.
     *
     * @returns A topological sorted list of plugins objects.
     */
    static async loadAll(configuration:Configuration):Promise<{
        configuration:Configuration
        plugins:Array<Plugin>
    }> {
        const plugins:Mapping<Plugin> = {}
        /*
            Load main plugin configuration at first.

            NOTE: If application's main is this itself avoid loading twice.
        */
        if (configuration.name !== 'web-node')
            plugins[configuration.name] = await PluginAPI.load(
                configuration.name,
                configuration.name,
                plugins,
                configuration.core.plugin.configuration,
                configuration.core.context.path,
                configuration.core.encoding
            )

        for (const type in configuration.core.plugin.directories)
            if (
                Object.prototype.hasOwnProperty.call(
                    configuration.core.plugin.directories, type
                ) &&
                await Tools.isDirectory(
                    configuration.core.plugin.directories[type].path
                )
            ) {
                const compiledRegularExpression = new RegExp(
                    configuration.core.plugin.directories[type]
                        .nameRegularExpressionPattern
                )

                for (const pluginName of readdirSync(
                    configuration.core.plugin.directories[type].path
                )) {
                    if (!(compiledRegularExpression).test(pluginName))
                        continue

                    const currentPluginPath:string = resolve(
                        configuration.core.plugin.directories[type].path,
                        pluginName
                    )
                    const internalName:string = pluginName.replace(
                        compiledRegularExpression,
                        (fullMatch:string, firstMatch:string|number):string =>
                            typeof firstMatch === 'string' ?
                                firstMatch :
                                fullMatch
                    )

                    plugins[pluginName] = await PluginAPI.load(
                        pluginName,
                        internalName,
                        plugins,
                        configuration.core.plugin.configuration,
                        currentPluginPath,
                        configuration.core.encoding
                    )
                }
            }

        const temporaryPlugins:Mapping<Array<string>> = {}

        for (const pluginName in plugins)
            if (Object.prototype.hasOwnProperty.call(plugins, pluginName)) {
                temporaryPlugins[plugins[
                    pluginName
                ].internalName] = plugins[pluginName].dependencies

                if (Object.prototype.hasOwnProperty.call(
                    configuration.core.interDependencies,
                    plugins[pluginName].internalName
                ))
                    for (const name of ([] as Array<string>).concat(
                        configuration.core.interDependencies[
                            plugins[pluginName].internalName
                        ] as ConcatArray<string>
                    ))
                        if (!temporaryPlugins[plugins[
                            pluginName
                        ].internalName].includes(name))
                            temporaryPlugins[plugins[pluginName].internalName]
                                .push(name)
            }

        const sortedPlugins:Array<Plugin> = []

        for (const pluginName of Tools.arraySortTopological(temporaryPlugins))
            for (const name in plugins)
                if (Object.prototype.hasOwnProperty.call(plugins, name))
                    if ([plugins[name].internalName, name].includes(
                        pluginName
                    )) {
                        sortedPlugins.push(plugins[name])
                        break
                    }

        return {
            configuration: PluginAPI.loadConfigurations(
                sortedPlugins, configuration
            ),
            plugins: sortedPlugins
        }
    }
    // TODO test
    /**
     * Transform a list of absolute paths respecting the application context.
     * @param configuration - Configuration object.
     * @param locations - Locations to process.
     *
     * @returns Given and processed locations.
     */
    static determineLocations(
        configuration:Configuration, locations:Array<string>|string = []
    ):Array<string> {
        locations = ([] as Array<string>).concat(locations)

        return locations.length ?
            locations.map((location:string):string =>
                resolve(configuration.core.context.path, location)
            ) :
            [configuration.core.context.path]
    }
    /**
     * Ignore absolute defined locations (relativ to application context) and
     * relative defined in each loaded plugin location.
     * @param configuration - Configuration object.
     * @param plugins - List of acctive plugins.
     * @param filePath - Path to search for.
     * @param locations - Locations to search in.
     *
     * @returns A boolean indicating whether given file path is in provided
     * locations.
     */
    static isInLocations(
        configuration:Configuration,
        plugins:Array<Plugin>,
        filePath:string,
        locations:Array<string>|string
    ):boolean {
        const pluginPaths:Array<string> = plugins.map((plugin:Plugin):string =>
            plugin.path
        )

        for (const location of ([] as Array<string>).concat(locations))
            if (location.startsWith('/')) {
                if (filePath.startsWith(
                    join(configuration.core.context.path, location)
                ))
                    return true
            } else
                for (const pluginPath of pluginPaths)
                    if (
                        filePath.startsWith(resolve(pluginPath, location))
                    )
                        return true

        return false
    }
}
export default PluginAPI
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
