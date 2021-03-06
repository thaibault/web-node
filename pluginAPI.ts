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
import {Encoding, Mapping, PlainObject, ValueOf} from 'clientnode/type'
import fileSystem from 'fs'
import path from 'path'

import baseConfiguration from './configurator'
import {
    Configuration, MetaConfiguration, Plugin, PluginChange, PluginConfiguration
} from './type'
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
     * @param parameter - Additional parameter to forward into plugin api.
     * @returns A promise which resolves when all callbacks have resolved their
     * promise holding given potentially modified data.
     */
    static async callStack(
        hook:string,
        plugins:Array<Plugin>,
        configuration:Configuration,
        data:any = null,
        ...parameter:Array<any>
    ):Promise<any> {
        if (configuration.plugin.hotReloading) {
            const pluginsWithChangedConfiguration:Array<Plugin> =
                PluginAPI.hotReloadConfigurationFile(
                    plugins, configuration.plugin.configuration.propertyNames
                )
            if (pluginsWithChangedConfiguration.length) {
                if (configuration.debug)
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
                if (configuration.debug)
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
                        ...parameter.concat(
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
                    if (error.message?.startsWith('NotImplemented:'))
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
                if (configuration.debug)
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
     * @param parameter - Additional parameter to forward into plugin api.
     * @returns Given potentially modified data.
     */
    static callStackSynchronous(
        hook:string,
        plugins:Array<Plugin>,
        configuration:Configuration,
        data:any = null,
        ...parameter:Array<any>
    ):any {
        for (const plugin of plugins)
            if (plugin.api) {
                let result:any
                try {
                    result = plugin.api(
                        hook,
                        data,
                        ...parameter.concat(configuration, plugins)
                    )
                } catch (error) {
                    if (error.message?.startsWith('NotImplemented:'))
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
                if (configuration.debug)
                    console.info(
                        `Ran synchronous hook "${hook}" for plugin "` +
                        `${plugin.name}".`
                    )
            }
        return data
    }
    /**
     * Checks for changed plugin api file in given plugins and reloads them
     * if necessary (new timestamp).
     * @param plugins - List of plugins to search for updates in.
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
                    pluginChange.oldScope.hasOwnProperty(name) &&
                    pluginChange.newScope.hasOwnProperty(name) &&
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
     * @returns A list with plugins which have a changed configurations.
     */
    static hotReloadConfigurationFile(
        plugins:Array<Plugin>, configurationPropertyNames:Array<string>
    ):Array<Plugin> {
        const pluginsWithChangedFiles:Array<Plugin> = []
        const pluginChanges:Array<PluginChange> = PluginAPI.hotReloadFiles(
            'configuration', 'configuration', plugins
        )
        for (const change of pluginChanges) {
            change.plugin.configuration = PluginAPI.loadConfiguration(
                change.plugin.configuration, configurationPropertyNames
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
     * @returns A list with plugin changes.
     */
    static hotReloadFiles(
        type:'api'|'configuration',
        target:'configuration'|'scope',
        plugins:Array<Plugin>
    ):Array<PluginChange> {
        const pluginChanges:Array<PluginChange> = []
        for (const plugin of plugins)
            if (plugin[target]) {
                let index:number = 0
                for (const filePath of plugin[
                    `${type}FilePaths` as
                        'apiFilePaths'|'configurationFilePaths'
                ]) {
                    const timestamp:number =
                        fileSystem.statSync(filePath).mtime.getTime()
                    if (
                        plugin[
                            `${type}FileLoadTimestamps` as
                                'apiFileLoadTimestamps'|
                                'configurationFileLoadTimestamps'
                        ][index] < timestamp
                    ) {
                        // Enforce to reload new file version.
                        /* eslint-disable no-eval */
                        delete eval('require')
                            .cache[eval('require').resolve(filePath)]
                        /* eslint-enable no-eval */
                        const oldScope:ValueOf<Plugin> = plugin[target]
                        plugin[target] = PluginAPI.loadFile(
                            filePath, plugin.name, plugin[target]
                        ) as PlainObject
                        pluginChanges.push({
                            newScope: plugin[target] as object,
                            oldScope,
                            plugin,
                            target
                        })
                    }
                    plugin[
                        `${type}FileLoadTimestamps` as
                            'apiFileLoadTimestamps'|
                            'configurationFileLoadTimestamps'
                    ][index] = timestamp
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
     * @returns An object of plugin specific meta informations.
     */
    static async load(
        name:string,
        internalName:string,
        plugins:Mapping<Plugin>,
        metaConfiguration:MetaConfiguration,
        pluginPath:string,
        encoding:Encoding = 'utf8'
    ):Promise<Plugin> {
        const configurationFilePaths:Array<string> = []
        const packageConfiguration:PlainObject = {}
        for (const fileName of metaConfiguration.fileNames) {
            const filePath:string = path.resolve(pluginPath, fileName)
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
            const configuration:PlainObject = PluginAPI.loadConfiguration(
                packageConfiguration, metaConfiguration.propertyNames
            )
            if ((configuration.package as PlainObject).hasOwnProperty('main'))
                apiFilePaths[0] =
                    (configuration.package as PlainObject).main as string
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
     * @returns Plugin meta informations object.
     */
    static async loadAPI(
        relativeFilePaths:Array<string>,
        pluginPath:string,
        name:string,
        internalName:string,
        plugins:Mapping<Plugin>,
        encoding:Encoding = 'utf8',
        configuration:null|PluginConfiguration = null,
        configurationFilePaths:Array<string> = []
    ):Promise<Plugin> {
        let filePath:string = path.resolve(pluginPath, relativeFilePaths[0])
        if (!(await Tools.isFile(filePath)))
            // Determine entry file if given one does not exist.
            for (const fileName of fileSystem.readdirSync(pluginPath))
                if (
                    !configurationFilePaths.map((filePath:string):string =>
                        path.basename(filePath)
                    ).includes(fileName) &&
                    await Tools.isFile(path.resolve(pluginPath, fileName))
                ) {
                    filePath = path.resolve(pluginPath, filePath)
                    if (['index', 'main'].includes(path.basename(
                        filePath, path.extname(fileName)
                    )))
                        break
                }
        let api:Function|null = null
        let nativeAPI:boolean = false
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
                api = (hook:string, data:any, ...parameter:Array<any>):any => {
                    if (hook in plugins[name].scope!)
                        return (
                            plugins[name].scope as Mapping<Function>
                        )[hook](data, ...parameter)
                    throw new Error(
                        `NotImplemented: API method "${hook}" is not ` +
                        `implemented in plugin "${name}".`
                    )
                }
            } else
                // NOTE: Any executable file can represent an api.
                api = (data:any, ...parameter:Array<any>):any => {
                    const childProcessResult:SpawnSyncReturns<string> =
                        spawnChildProcessSync(
                            filePath,
                            Tools.arrayMake(parameter),
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
        return {
            api,
            apiFilePaths: api ? [filePath] : [],
            apiFileLoadTimestamps:
                api ? [fileSystem.statSync(filePath).mtime.getTime()] : [],
            configuration:
                (
                    configuration === null ||
                    typeof configuration === 'undefined'
                ) ?
                    {} :
                    configuration,
            configurationFilePaths,
            configurationFileLoadTimestamps:
                configurationFilePaths.map((filePath:string):number =>
                    fileSystem.statSync(filePath).mtime.getTime()
                ),
            dependencies: configuration?.dependencies || [],
            internalName,
            name,
            path: pluginPath,
            scope: nativeAPI ? PluginAPI.loadFile(filePath, name) : null
        }
    }
    /**
     * Loads plugin specific configuration object.
     * @param packageConfiguration - Plugin specific package configuration
     * object.
     * @param configurationPropertyNames - Property names to search for to use
     * as entry in plugin configuration file.
     * @returns Determined configuration object.
     */
    static loadConfiguration(
        packageConfiguration:PlainObject,
        configurationPropertyNames:Array<string>
    ):PlainObject {
        const packageConfigurationCopy:PlainObject = Tools.copy(
            packageConfiguration, -1, true
        )
        for (const propertyName of configurationPropertyNames)
            if (packageConfiguration.hasOwnProperty(propertyName)) {
                const configuration:PluginConfiguration =
                    packageConfiguration[propertyName] as PluginConfiguration
                configuration.package = packageConfigurationCopy
                // NOTE: We should break the cycle here.
                delete configuration.package[propertyName]
                // Removing comments (default key name to delete is "#").
                return Tools.removeKeys(configuration)
            }
        /*
            No plugin specific configuration found. Only provide package
            configuration.
            Removing comments (default key name to delete is "#").
        */
        return Tools.removeKeys({package: packageConfigurationCopy})
    }
    /**
     * Loads given plugin configurations into global configuration.
     * @param plugins - Topological sorted list of plugins to check for
     * configurations.
     * @param configuration - Global configuration to extend with.
     * @returns Updated given configuration object.
     */
    static loadConfigurations(
        plugins:Array<Plugin>, configuration:Configuration
    ):Configuration {
        // First clear current configuration but reuse old given reference.
        for (const key in configuration)
            if (configuration.hasOwnProperty(key))
                delete configuration[key]
        Tools.extend(configuration, Tools.copy(baseConfiguration, -1, true))
        for (const plugin of plugins)
            if (plugin.configuration) {
                const pluginConfiguration:PlainObject = Tools.copy(
                    plugin.configuration, -1, true)
                delete pluginConfiguration.package
                Tools.extend(
                    true,
                    Tools.modifyObject(configuration, pluginConfiguration),
                    pluginConfiguration
                )
                if (configuration.runtimeConfiguration)
                    Tools.extend(
                        true, configuration, configuration.runtimeConfiguration
                    )
            }
        const now:Date = new Date()
        const packageConfiguration:PlainObject = configuration.package
        delete (configuration as {package?:Configuration['package']}).package
        configuration = Tools.evaluateDynamicData(
            Tools.removeEvaluationInDynamicData(configuration),
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
        ) as Configuration
        /*
            NOTE: We have to replace the resolved plugin configurations in the
            plugin data structure.
        */
        for (const plugin of plugins)
            if (configuration.hasOwnProperty(plugin.internalName))
                plugin.configuration = configuration[plugin.internalName]
        configuration.package = packageConfiguration
        return configuration
    }
    /**
     * Load given api file path and returns exported scope.
     * @param filePath - Path to file to load.
     * @param name - Plugin name to use for proper error messages.
     * @param fallbackScope - Scope to return if an error occurs during
     * loading. If a "null" is given an error will be thrown.
     * @param log - Enables logging.
     * @returns Exported api file scope.
     */
    static loadFile(
        filePath:string,
        name:string,
        fallbackScope:null|object = null,
        log:boolean = true
    ):object {
        let reference:string|undefined
        try {
            /* eslint-disable no-eval */
            reference = eval('require').resolve(filePath)
            /* eslint-enable no-eval */
        } catch (error) {}
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
        if (scope.hasOwnProperty('default'))
            return (scope as {default:object}).default
        return scope
    }
    /**
     * Extends given configuration object with all plugin specific ones and
     * returns a topological sorted list of plugins with plugins specific
     * meta informations stored.
     * @param configuration - Configuration object to extend and use.
     * @returns A topological sorted list of plugins objects.
     */
    static async loadAll(configuration:Configuration):Promise<{
        configuration:Configuration
        plugins:Array<Plugin>
    }> {
        const plugins:Mapping<Plugin> = {}
        // If application's main is this itself avoid loading twice.
        if (configuration.name !== 'web-node')
            plugins[configuration.name] = await PluginAPI.load(
                configuration.name,
                configuration.name,
                plugins,
                configuration.plugin.configuration,
                configuration.context.path,
                configuration.encoding
            )
        for (const type in configuration.plugin.directories)
            if (
                configuration.plugin.directories.hasOwnProperty(type) &&
                await Tools.isDirectory(
                    configuration.plugin.directories[
                        type as 'external'|'internal'
                    ].path
                )
            ) {
                const compiledRegularExpression:RegExp = new RegExp(
                    configuration.plugin.directories[
                        type as 'external'|'internal'
                    ].nameRegularExpressionPattern)
                for (const pluginName of fileSystem.readdirSync(
                    configuration.plugin.directories[
                        type as 'external'|'internal'
                    ].path
                )) {
                    if (!(compiledRegularExpression).test(pluginName))
                        continue
                    const currentPluginPath:string = path.resolve(
                        configuration.plugin.directories[
                            type as 'external'|'internal'
                        ].path,
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
                        configuration.plugin.configuration,
                        currentPluginPath,
                        configuration.encoding
                    )
                }
            }
        const temporaryPlugins:Mapping<Array<string>> = {}
        for (const pluginName in plugins)
            if (plugins.hasOwnProperty(pluginName)) {
                temporaryPlugins[plugins[
                    pluginName
                ].internalName] = plugins[pluginName].dependencies
                if (configuration.interDependencies.hasOwnProperty(plugins[
                    pluginName
                ].internalName))
                    for (const name of ([] as Array<string>).concat(
                        configuration.interDependencies[
                            plugins[pluginName].internalName
                        ] as ConcatArray<string>
                    ))
                        if (!temporaryPlugins[plugins[
                            pluginName
                        ].internalName].includes(name))
                            temporaryPlugins[plugins[
                                pluginName
                            ].internalName].push(name)
            }
        const sortedPlugins:Array<Plugin> = []
        for (const pluginName of Tools.arraySortTopological(temporaryPlugins))
            for (const name in plugins)
                if (plugins.hasOwnProperty(name))
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
     * @return Given and processed locations.
     */
    static determineLocations(
        configuration:Configuration, locations:Array<string>|string = []
    ):Array<string> {
        locations = ([] as Array<string>).concat(locations)
        return locations.length ?
            locations.map((location:string):string =>
                path.resolve(configuration.context.path, location)
            ) :
            [configuration.context.path]
    }
    /**
     * Ignore absolute defined locations (relativ to application context) and
     * relative defined in each loaded plugin location.
     *
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
                    path.join(configuration.context.path, location)
                ))
                    return true
            } else
                for (const pluginPath of pluginPaths)
                    if (
                        filePath.startsWith(path.resolve(pluginPath, location))
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
