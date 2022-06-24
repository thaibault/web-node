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
    APIFunction,
    Configuration,
    EvaluateablePartialConfiguration,
    MetaPluginConfiguration,
    PackageConfiguration,
    Plugin,
    PluginChange,
    PluginConfiguration
} from './type'
// endregion
export const currentRequire = eval('require') as typeof require
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
        return oldResolveFilename(currentRequire.main!.id, parent, isMain)

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
     * @param this - Nothing.
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
    static async callStack<
        State extends HookState = HookState, Output = unknown
    >(this:void, state:State, ...parameters:Array<unknown>):Promise<Output> {
        const {configuration, hook, plugins} = state

        const isConfigurationHook:boolean =
            hook.endsWith('ConfigurationLoaded') ||
            hook.endsWith('ConfigurationHotLoaded')

        if (configuration.core.plugin.hotReloading) {
            if (!isConfigurationHook) {
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

                    const state = {
                        ...state,
                        data: configuration,
                        pluginsWithChangedConfiguration
                    }

                    await PluginAPI.callStack<
                        HookState<Configuration, ChangedConfigurationState>,
                        void
                    >({...state, hook: 'preConfigurationHotLoaded'})

                    PluginAPI.loadConfigurations(plugins, configuration)

                    await PluginAPI.callStack<
                        HooksState<Configuration, ChangedConfigurationState>,
                        void
                    >({...state, hook: 'postConfigurationHotLoaded'})
                }
            }

            if (hook !== 'apiFileReloaded') {
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

                    await PluginAPI.callStack<
                        HookState<Array<Plugin>, ChangedAPIFileState>, void
                    >(
                        {
                            ...state,
                            data: pluginsWithChangedAPIFiles,
                            hook: 'apiFileReloaded'
                        }
                    )
                }
            }
        }

        for (const plugin of plugins)
            if (plugin.api) {
                let result:Output
                try {
                    result = await plugin.api(state, ...parameters) as Output
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

                data = result as unknown as Input

                if (configuration.core.debug)
                    console.info(
                        `Ran asynchronous hook "${hook}" for plugin "` +
                        `${plugin.name}".`
                    )
            }

        return data as unknown as Output
    }
    /**
     * Calls all plugin methods for given trigger description synchronous.
     * @param this - Nothing.
     * @param hook - Hook to trigger.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param configuration - Plugin extendable configuration object.
     * @param data - Data to pipe throw all plugins and resolve after all
     * plugins have been resolved.
     * @param parameters - Additional parameters to forward into plugin api.
     *
     * @returns Given potentially modified data.
     */
    static callStackSynchronous<
        State extends HookState = HookState, Output = unknown
    >(this:void, state:State, ...parameters:Array<unknown>):Output {
        const {configuration, hook, plugins} = state

        for (const plugin of plugins)
            if (plugin.api) {
                let result:Output
                try {
                    result = plugin.api(state, ...parameters) as Output
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

                data = result as unknown as Input

                if (configuration.core.debug)
                    console.info(
                        `Ran synchronous hook "${hook}" for plugin "` +
                        `${plugin.name}".`
                    )
            }

        return data as unknown as Output
    }
    /**
     * Converts given plugin name into the corresponding internal
     * representation.
     * @param this - Nothing.
     * @param name - Name to convert.
     * @param regularExpression - Regular expression pattern which extracts
     * relevant name path as first match group.
     *
     * @returns Transformed name.
     */
    static determineInternalName(
        this:void, name:string, regularExpression:RegExp
    ):string {
        return Tools.stringDelimitedToCamelCase(name.replace(
            regularExpression,
            (fullMatch:string, firstMatch:string|number):string =>
                typeof firstMatch === 'string' ?
                    firstMatch :
                    fullMatch
        ))
    }
    /**
     * Evaluates given configuration object by letting plugins package sub
     * structure untouched.
     * @param this - Nothing.
     * @param configuration - Evaluateable configuration structure.
     *
     * @returns Resolved configuration.
     */
    static evaluateConfiguration<Type = Configuration>(
        this:void, configuration:RecursiveEvaluateable<Type>|Type
    ):Type {
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

        const now = new Date()

        configuration = Tools.evaluateDynamicData<Type>(
            Tools.removeKeysInEvaluation(configuration) as
                RecursiveEvaluateable<Type>,
            {
                currentPath: process.cwd(),
                fileSystem,
                path,
                PluginAPI,
                require: currentRequire,
                Tools,
                webNodePath: __dirname,
                now,
                nowUTCTimestamp: Tools.numberGetUTCTimestamp(now)
            }
        )

        for (const [name, pluginPackageConfiguration] of Object.entries(
            pluginPackageConfigurationBackup
        ))
            (configuration as unknown as Configuration)[name].package =
                pluginPackageConfiguration

        return configuration
    }
    /**
     * Checks for changed plugin api file in given plugins and reloads them
     * if necessary (new timestamp).
     * @param this - Nothing.
     * @param plugins - List of plugins to search for updates in.
     *
     * @returns A list with plugins which have a changed api scope.
     */
    static hotReloadAPIFile(this:void, plugins:Array<Plugin>):Array<Plugin> {
        const pluginsWithChangedFiles:Array<Plugin> = []
        const pluginChanges:Array<PluginChange> =
            PluginAPI.hotReloadFiles('api', 'scope', plugins)

        for (const pluginChange of pluginChanges)
            if (pluginChange.oldScope) {
                // NOTE: We have to migrate old plugin api's scope state.
                for (const [name, value] of Object.entries(
                    pluginChange.oldScope
                ))
                    if (
                        Object.prototype.hasOwnProperty.call(
                            pluginChange.newScope, name
                        ) &&
                        !Tools.isFunction(
                            (pluginChange.newScope as Mapping<unknown>)[name]
                        )
                    )
                        (pluginChange.newScope as Mapping<unknown>)[name] =
                            value

                pluginsWithChangedFiles.push(pluginChange.plugin)
            }

        return pluginsWithChangedFiles
    }
    /**
     * Checks for changed plugin configurations in given plugins and reloads
     * them if necessary (new timestamp).
     * @param this - Nothing.
     * @param plugins - List of plugins to search for updates in.
     * @param configurationPropertyNames - Property names to search for to use
     * as entry in plugin configuration file.
     *
     * @returns A list with plugins which have a changed configurations.
     */
    static hotReloadConfigurationFile(
        this:void,
        plugins:Array<Plugin>,
        configurationPropertyNames:Array<string>
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
     * @param this - Nothing.
     * @param type - Plugin file type to search for updates.
     * @param target - Property name existing in plugin meta informations
     * objects which should be updated.
     * @param plugins - List of plugins to search for updates in.
     *
     * @returns A list with plugin changes.
     */
    static hotReloadFiles(
        this:void,
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
                        delete (currentRequire.cache as Mapping<unknown>)[
                            currentRequire.resolve(filePath)
                        ]

                        const oldScope:ValueOf<Plugin> = plugin[target]

                        plugin[target] = PluginAPI.loadFile(
                            filePath, plugin.name, plugin[target]
                        ) as PackageConfiguration

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
     * @param this - Nothing.
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
        this:void,
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
            internalName =
                packageConfiguration.webNodeInternalName || internalName

            const configuration:EvaluateablePartialConfiguration =
                PluginAPI.loadConfiguration(
                    internalName,
                    packageConfiguration,
                    metaConfiguration.propertyNames
                )

            if (configuration[internalName].package.main)
                apiFilePaths[0] = configuration[internalName].package.main!

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
            apiFilePaths,
            pluginPath,
            name,
            internalName,
            plugins,
            encoding
        )
    }
    /**
     * Load given plugin api file in given path and generates a plugin
     * specific data structure with useful meta informations.
     * @param this - Nothing.
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
        this:void,
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

        let api:APIFunction = null
        let nativeAPI = false

        if (
            configuration &&
            /*
                NOTE: Check if a webNode plugin configuration is available
                indicating a backend responsibility for api file.

                NOTE: One key is always there representing the whole package
                configuration.
            */
            (
                Object.keys(configuration).length > 1 ||
                configuration[internalName] &&
                Object.keys(configuration[internalName]).length > 1
            ) &&
            await Tools.isFile(filePath)
        )
            if (filePath.endsWith('.js')) {
                nativeAPI = true
                api = (state, ...parameters:Array<unknown>) => {
                    if (state.hook in plugins[name].scope!)
                        return (
                            plugins[name].scope as Mapping<APIFunction>
                        )[state.hook](state, ...parameters, PluginAPI)

                    throw new Error(
                        `NotImplemented: API method "${state.hook}" is not ` +
                        `implemented in plugin "${name}".`
                    )
                }
            } else
                // NOTE: Any executable file can represent an api.
                api = ({hook, data}, ...parameters:Array<unknown>) => {
                    const childProcessResult:SpawnSyncReturns<string> =
                        spawnChildProcessSync(
                            filePath,
                            [
                                hook,
                                ...(parameters.map(
                                    (item:unknown):string =>
                                        JSON.stringify(item)
                                ))
                            ],
                            {
                                cwd: process.cwd(),
                                encoding,
                                env: process.env,
                                input: JSON.stringify(data),
                                shell: true,
                                stdio: 'inherit'
                            }
                        )
                    if (
                        childProcessResult.stdout.startsWith('##') &&
                        childProcessResult.stdout.endsWith('##')
                    )
                        data = JSON.parse(data as string)

                    // TODO check if method wasn't implemented by special
                    // returnCode
                    return data
                }

        const pluginConfiguration:EvaluateablePartialConfiguration =
            configuration ?? {[internalName]: {package: {}}}

        return {
            api,
            apiFileLoadTimestamps:
                api ? [statSync(filePath).mtime.getTime()] : [],
            apiFilePaths: api ? [filePath] : [],

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
     * @param this - Nothing.
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
        this:void,
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
            Tools.removeKeyPrefixes(Tools.copy(packageConfiguration))

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
     * @param this - Nothing.
     * @param plugins - Topological sorted list of plugins to check for
     * configurations.
     * @param configuration - Global configuration to extend with.
     *
     * @returns Updated given configuration object.
     */
    static loadConfigurations(
        this:void, plugins:Array<Plugin>, configuration:Configuration
    ):Configuration {
        /*
            First clear current configuration content key by key to let old top
            level configuration reference in usable.
        */
        for (const key of Object.keys(configuration))
            delete configuration[key]
        Tools.extend(configuration, Tools.copy(baseConfiguration))

        for (const plugin of plugins)
            if (plugin.configuration) {
                const pluginConfiguration:EvaluateablePartialConfiguration =
                    Tools.copy(plugin.configuration)

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
                    plugin specific configuration set to give runtime
                    configuration always the highest priority when resolving
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
        ) as Configuration
    }
    /**
     * Load given api file path and returns exported scope.
     * @param this - Nothing.
     * @param filePath - Path to file to load.
     * @param name - Plugin name to use for proper error messages.
     * @param fallbackScope - Scope to return if an error occurs during
     * loading. If a "null" is given an error will be thrown.
     * @param log - Enables logging.
     *
     * @returns Exported api file scope.
     */
    static loadFile(
        this:void,
        filePath:string,
        name:string,
        fallbackScope:null|object = null,
        log = true
    ):object {
        let reference:string|undefined
        try {
            reference = currentRequire.resolve(filePath)
        } catch (error) {
            // Ignore error.
        }

        // Clear module cache to get actual new module scope.
        if (reference && reference in currentRequire.cache)
            delete currentRequire.cache[reference]

        let scope:object
        try {
            scope = currentRequire(filePath) as object
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
     * @param this - Nothing.
     * @param configuration - Configuration object to extend and use.
     *
     * @returns A topological sorted list of plugins objects.
     */
    static async loadAll(this:void, configuration:Configuration):Promise<{
        configuration:Configuration
        plugins:Array<Plugin>
    }> {
        const plugins:Mapping<Plugin> = {}
        /*
            Load main plugin configuration at first.

            NOTE: If application's main is this itself avoid loading it twice.
        */
        if (configuration.name !== 'web-node')
            plugins[configuration.name] = await PluginAPI.load(
                configuration.name,
                PluginAPI.determineInternalName(
                    configuration.name,
                    new RegExp(
                        configuration.core.plugin.directories.external
                            .nameRegularExpressionPattern
                    )
                ),
                plugins,
                configuration.core.plugin.configuration,
                configuration.core.context.path,
                configuration.core.encoding
            )

        for (const directory of Object.values(
            configuration.core.plugin.directories
        ))
            if (await Tools.isDirectory(directory.path)) {
                const compiledRegularExpression =
                    new RegExp(directory.nameRegularExpressionPattern)

                for (const pluginName of readdirSync(directory.path)) {
                    if (!(compiledRegularExpression).test(pluginName))
                        continue

                    const currentPluginPath:string = resolve(
                        directory.path, pluginName
                    )
                    const internalName:string =
                        PluginAPI.determineInternalName(
                            pluginName, compiledRegularExpression
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

        for (const plugin of Object.values(plugins)) {
            temporaryPlugins[plugin.internalName] = plugin.dependencies

            if (Object.prototype.hasOwnProperty.call(
                configuration.core.interDependencies, plugin.internalName
            ))
                for (const name of ([] as Array<string>).concat(
                    configuration.core.interDependencies[
                        plugin.internalName
                    ] as ConcatArray<string>
                ))
                    if (!temporaryPlugins[plugin.internalName].includes(name))
                        temporaryPlugins[plugin.internalName].push(name)
        }

        const sortedPlugins:Array<Plugin> = []

        for (const pluginName of Tools.arraySortTopological(temporaryPlugins))
            for (const [name, plugin] of Object.entries(plugins))
                if ([plugin.internalName, name].includes(pluginName)) {
                    sortedPlugins.push(plugin)

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
     * @param this - Nothing.
     * @param configuration - Configuration object.
     * @param locations - Locations to process.
     *
     * @returns Given and processed locations.
     */
    static determineLocations(
        this:void,
        configuration:Configuration,
        locations:Array<string>|string = []
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
     * @param this - Nothing.
     * @param configuration - Configuration object.
     * @param plugins - List of acctive plugins.
     * @param filePath - Path to search for.
     * @param locations - Locations to search in.
     *
     * @returns A boolean indicating whether given file path is in provided
     * locations.
     */
    static isInLocations(
        this:void,
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
