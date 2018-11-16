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
import {spawnSync as spawnChildProcessSync} from 'child_process'
import Tools from 'clientnode'
import type {PlainObject} from 'clientnode'
import fileSystem from 'fs'
import path from 'path'

import baseConfiguration from './configurator'
import type {Configuration, Plugin} from './type'
// endregion
/**
 * A dumm plugin interface with all available hooks.
 */
export class PluginAPI {
    /**
     * Calls all plugin methods for given trigger description asynchrone and
     * waits for their resolved promises.
     * @param type - Type of trigger.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param configuration - Plugin extendable configuration object.
     * @param data - Data to pipe throw all plugins and resolve after all
     * plugins have been resolved.
     * @param parameter - Additional parameter to forward into plugin api.
     * @returns A promise which resolves when all callbacks have resolved their
     * promise holding given potentially modified data.
     */
    static async callStack(
        type:string,
        plugins:Array<Plugin>,
        configuration:Configuration,
        data:any = null,
        ...parameter:Array<any>
    ):Promise<any> {
        if (configuration.plugin.hotReloading && ![
            'configurationLoaded', 'apiFileReloaded'
        ].includes(type)) {
            const pluginsWithChangedConfiguration:Array<Plugin> =
                PluginAPI.hotReloadFile(
                    'configurationFile', 'configuration', plugins)
            if (pluginsWithChangedConfiguration.length) {
                if (configuration.debug)
                    console.info(
                        'Configuration for "' +
                        `${pluginsWithChangedConfiguration.map((
                            plugin:Plugin
                        ):string => plugin.name).join('", "')}" ` +
                        'has been changed: reloading initialized.')
                PluginAPI.callStack(
                    'preConfigurationLoaded',
                    plugins,
                    configuration,
                    configuration,
                    pluginsWithChangedConfiguration
                )
                PluginAPI.loadConfigurations(plugins, configuration)
                PluginAPI.callStack(
                    'postConfigurationLoaded',
                    plugins,
                    configuration,
                    configuration,
                    pluginsWithChangedConfiguration
                )
            }
            const pluginsWithChangedAPIFiles:Array<Plugin> =
                PluginAPI.hotReloadFile('apiFile', 'scope', plugins)
            if (pluginsWithChangedAPIFiles.length) {
                if (configuration.debug)
                    console.info(
                        'API-file for "' +
                        `${pluginsWithChangedAPIFiles.map((
                            plugin:Plugin
                        ):string => plugin.name).join('", "')}" ` +
                        'has been changed: reloading initialized.')
                PluginAPI.callStack(
                    'apiFileReloaded',
                    plugins,
                    configuration,
                    pluginsWithChangedConfiguration
                )
            }
        }
        for (const plugin:Plugin of plugins)
            if (plugin.api) {
                let result:any
                try {
                    result = await plugin.api.call(
                        PluginAPI, type, data, ...parameter.concat([
                            configuration, plugins]))
                } catch (error) {
                    if ('message' in error && error.message.startsWith(
                        'NotImplemented:'
                    ))
                        continue
                    throw new Error(
                        `Plugin "${plugin.internalName}" ` + (
                            plugin.internalName === plugin.name ? '' :
                            `(${plugin.name}) `
                        )+ `throws: ${Tools.representObject(error)} during ` +
                        `asynchrone hook "${type}".`)
                }
                data = result
                if (configuration.debug)
                    console.info(
                        `Ran asynchrone hook "${type}" for plugin "` +
                        `${plugin.name}".`)
            }
        return data
    }
    /**
     * Calls all plugin methods for given trigger description synchrone.
     * @param type - Type of trigger.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param configuration - Plugin extendable configuration object.
     * @param data - Data to pipe throw all plugins and resolve after all
     * plugins have been resolved.
     * @param parameter - Additional parameter to forward into plugin api.
     * @returns Given potentially modified data.
     */
    static callStackSynchronous(
        type:string,
        plugins:Array<Plugin>,
        configuration:Configuration,
        data:any = null,
        ...parameter:Array<any>
    ):any {
        for (const plugin:Plugin of plugins)
            if (plugin.api) {
                let result:any
                try {
                    result = plugin.api.call(
                        PluginAPI, type, data, ...parameter.concat([
                            configuration, plugins]))
                } catch (error) {
                    if ('message' in error && error.message.startsWith(
                        'NotImplemented:'
                    ))
                        continue
                    throw new Error(
                        `Plugin "${plugin.internalName}" ` + (
                            plugin.internalName === plugin.name ? '' :
                            `(${plugin.name}) `
                        ) + `throws: ${Tools.representObject(error)} during ` +
                        `synchrone hook "${type}".`)
                }
                data = result
                if (configuration.debug)
                    console.info(
                        `Ran synchrone hook "${type}" for plugin "` +
                        `${plugin.name}".`)
            }
        return data
    }
    /**
     * Checks for changed plugin file type in given plugins and reloads them
     * if necessary (new timestamp).
     * @param type - Plugin file type to search for updates.
     * @param targetType - Property name existing in plugin meta informations
     * objects which should be updated.
     * @param plugins - List of plugins to search for updates in.
     * @returns A list with plugins which have a changed plugin file of given
     * type.
     */
    static hotReloadFile(
        type:string, targetType:string, plugins:Array<Plugin>
    ):Array<Plugin> {
        const pluginsWithChangedFiles:Array<Plugin> = []
        for (const plugin:Plugin of plugins)
            if (plugin[targetType]) {
                const timestamp:number = fileSystem.statSync(
                    plugin[`${type}Path`]
                ).mtime.getTime()
                if (plugin[`${type}LoadTimestamp`] < timestamp) {
                    // Enforce to reload new file version.
                    /* eslint-disable no-eval */
                    delete eval('require').cache[eval('require').resolve(
                        plugin[`${type}Path`])]
                    /* eslint-enable no-eval */
                    plugin[targetType] = PluginAPI.loadFile(
                        plugin[`${type}Path`], plugin.name, plugin[targetType])
                    pluginsWithChangedFiles.push(plugin)
                }
                plugin[`${type}LoadTimestamp`] = timestamp
            }
        return pluginsWithChangedFiles
    }
    /**
     * Extends given configuration object with given plugin specific ones and
     * returns a plugin specific meta information object.
     * @param name - Name of plugin to extend.
     * @param internalName - Internal name of plugin to extend.
     * @param plugins - List of all yet determined plugin informations.
     * @param configurationPropertyNames - Property names to search for to use
     * as entry in plugin configuration file.
     * @param pluginPath - Path to given plugin.
     * @param encoding - Encoding to use to read and write from child
     * process's.
     * @returns An object of plugin specific meta informations.
     */
    static async load(
        name:string,
        internalName:string,
        plugins:{[key:string]:Plugin},
        configurationPropertyNames:Array<string>,
        pluginPath:string,
        encoding:string = 'utf8'
    ):Promise<Plugin> {
        const configurationFilePath:string = path.resolve(
            pluginPath, 'package.json')
        let packageConfiguration:?PlainObject = null
        if (configurationFilePath && await Tools.isDirectory(
            pluginPath
        ) && await Tools.isFile(configurationFilePath))
            packageConfiguration = PluginAPI.loadFile(
                configurationFilePath, name)
        let apiFilePath:string = 'index.js'
        if (packageConfiguration) {
            const packageConfigurationCopy:PlainObject = Tools.copy(
                packageConfiguration, -1, true)
            for (const propertyName:string of configurationPropertyNames)
                if (packageConfiguration.hasOwnProperty(propertyName)) {
                    if (packageConfiguration.hasOwnProperty('main'))
                        apiFilePath = packageConfiguration.main
                    const pluginConfiguration:PlainObject =
                        packageConfiguration[propertyName]
                    pluginConfiguration.package = packageConfigurationCopy
                    delete pluginConfiguration.package[propertyName]
                    return await PluginAPI.loadAPI(
                        apiFilePath,
                        pluginPath,
                        name,
                        internalName,
                        plugins,
                        encoding,
                        pluginConfiguration,
                        configurationFilePath
                    )
                }
            return await PluginAPI.loadAPI(
                apiFilePath,
                pluginPath,
                name,
                internalName,
                plugins,
                encoding,
                {package: packageConfigurationCopy},
                configurationFilePath
            )
        }
        return await PluginAPI.loadAPI(
            apiFilePath, pluginPath, name, internalName, plugins, encoding)
    }
    /**
     * Load given plugin api file in given path and generates a plugin
     * specific data structure with useful meta informations.
     * @param relativeFilePath - Path to file to load relatively from given
     * plugin path.
     * @param pluginPath - Path to plugin directory.
     * @param name - Plugin name to use for proper error messages.
     * @param internalName - Internal plugin name to use for proper error
     * messages.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param encoding - Encoding to use to read and write from child
     * process.
     * @param configuration - Plugin specific configurations.
     * @param configurationFilePath - Plugin specific configuration file path.
     * @returns Plugin meta informations object.
     */
    static async loadAPI(
        relativeFilePath:string,
        pluginPath:string,
        name:string,
        internalName:string,
        plugins:{[key:string]:Object},
        encoding:string = 'utf8',
        configuration:?PlainObject = null,
        configurationFilePath:?string = null
    ):Promise<Plugin> {
        let filePath:string = path.resolve(pluginPath, relativeFilePath)
        if (!(await Tools.isFile(filePath)))
            for (const fileName:string of fileSystem.readdirSync(pluginPath))
                if (fileName !== 'package.json' && await Tools.isFile(
                    path.resolve(pluginPath, fileName)
                )) {
                    filePath = path.resolve(pluginPath, filePath)
                    if (['index', 'main'].includes(path.basename(
                        filePath, path.extname(fileName)
                    )))
                        break
                }
        let api:?Function = null
        if (await Tools.isFile(filePath))
            if (filePath.endsWith('.js')) {
                api = (
                    type:string, data:any, ...parameter:Array<any>
                ):any => {
                    if (type in plugins[name].scope)
                        return plugins[name].scope[type](data, ...parameter)
                    throw new Error(
                        `NotImplemented: API method "${type}" is not ` +
                        `implemented in plugin "${name}".`)
                }
            } else
                api = (data:any, ...parameter:Array<any>):any => {
                    const childProcessResult:PlainObject =
                        spawnChildProcessSync(
                            filePath, Tools.arrayMake(parameter), {
                                cwd: process.cwd(),
                                encoding,
                                env: process.env,
                                input: Tools.representObject(data),
                                shell: true,
                                stdio: 'inherit'
                            })
                    if (childProcessResult.stdout.startsWith(
                        '##'
                    ) && childProcessResult.stdout.endsWith('##'))
                        data = JSON.parse(data)
                    // TODO check if method wasn't implemented by special
                    // returnCode
                    return data
                }
        return {
            api,
            apiFilePath: api && filePath,
            apiFileLoadTimestamp: api && fileSystem.statSync(
                filePath
            ).mtime.getTime(),
            configuration,
            configurationFilePath,
            configurationFileLoadTimestamp:
                configurationFilePath &&
                fileSystem.statSync(configurationFilePath).mtime.getTime() ||
                null,
            dependencies: configuration && configuration.hasOwnProperty(
                'dependencies'
            ) && configuration.dependencies || [],
            internalName,
            name,
            path: pluginPath,
            scope: api && PluginAPI.loadFile(filePath, name)
        }
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
        for (const key:string in configuration)
            if (configuration.hasOwnProperty(key))
                delete configuration[key]
        Tools.extendObject(configuration, Tools.copy(
            baseConfiguration, -1, true))
        for (const plugin:Plugin of plugins)
            if (plugin.configuration) {
                const pluginConfiguration:PlainObject = Tools.copy(
                    plugin.configuration, -1, true)
                delete pluginConfiguration.package
                Tools.extendObject(
                    true,
                    Tools.modifyObject(configuration, pluginConfiguration),
                    pluginConfiguration
                )
                if (configuration.runtimeConfiguration)
                    Tools.extendObject(
                        true, configuration, configuration.runtimeConfiguration
                    )
            }
        const now:Date = new Date()
        const packageConfiguration:PlainObject = configuration.package
        delete configuration.package
        configuration = Tools.evaluateDynamicDataStructure(
            PluginAPI.removePropertiesInDynamicObjects(configuration),
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
        /*
            NOTE: We have to replace the resolved plugin configurations in the
            plugin data structure.
        */
        for (const plugin:Plugin of plugins)
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
        fallbackScope:?Object = null,
        log:boolean = true
    ):Object {
        let scope:Object
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
                        `plugin "${name}": ${Tools.representObject(error)}. ` +
                        `Using fallback one.`)
            } else
                throw new Error(
                    `Couln't load plugin file "${filePath}" for plugin "` +
                    `${name}": ${Tools.representObject(error)}`)
        }
        if (scope.hasOwnProperty('default'))
            return scope.default
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
        configuration:Configuration;
        plugins:Array<Plugin>
    }> {
        const plugins:{[key:string]:Object} = {}
        // If an application's main
        if (configuration.name !== 'webNode')
            plugins[configuration.name] = await PluginAPI.load(
                configuration.name,
                configuration.name,
                plugins,
                configuration.plugin.configurationPropertyNames,
                configuration.context.path,
                configuration.encoding
            )
        for (const type:string in configuration.plugin.directories)
            if (
                configuration.plugin.directories.hasOwnProperty(type) &&
                await Tools.isDirectory(
                    configuration.plugin.directories[type].path)
            ) {
                const compiledRegularExpression:RegExp = new RegExp(
                    configuration.plugin.directories[
                        type
                    ].nameRegularExpressionPattern)
                for (const pluginName:string of fileSystem.readdirSync(
                    configuration.plugin.directories[type].path
                )) {
                    if (!(compiledRegularExpression).test(pluginName))
                        continue
                    const currentPluginPath:string = path.resolve(
                        configuration.plugin.directories[type].path, pluginName
                    )
                    const internalName:string = pluginName.replace(
                        compiledRegularExpression, (
                            fullMatch:string, firstMatch:string|number
                        ):string => (
                            typeof firstMatch === 'string'
                        ) ? firstMatch : fullMatch)
                    plugins[pluginName] = await PluginAPI.load(
                        pluginName,
                        internalName,
                        plugins,
                        configuration.plugin.configurationPropertyNames,
                        currentPluginPath,
                        configuration.encoding
                    )
                }
            }
        const temporaryPlugins:{[key:string]:Array<string>} = {}
        for (const pluginName:string in plugins)
            if (plugins.hasOwnProperty(pluginName)) {
                temporaryPlugins[plugins[
                    pluginName
                ].internalName] = plugins[pluginName].dependencies
                if (configuration.interDependencies.hasOwnProperty(plugins[
                    pluginName
                ].internalName))
                    for (const name:string of [].concat(
                        configuration.interDependencies[
                            plugins[pluginName].internalName])
                    )
                        if (!temporaryPlugins[plugins[
                            pluginName
                        ].internalName].includes(name))
                            temporaryPlugins[plugins[
                                pluginName
                            ].internalName].push(name)
            }
        const sortedPlugins:Array<Plugin> = []
        for (const pluginName:string of Tools.arraySortTopological(
            temporaryPlugins
        ))
            for (const name:string in plugins)
                if (plugins.hasOwnProperty(name))
                    if ([plugins[name].internalName, name].includes(
                        pluginName
                    )) {
                        sortedPlugins.push(plugins[name])
                        break
                    }
        return {
            plugins: sortedPlugins,
            configuration: PluginAPI.loadConfigurations(
                sortedPlugins, configuration)
        }
    }
    /**
     * Removes properties in objects where a dynamic indicator lives.
     * @param data - Object to traverse recursively.
     * @returns Given object with removed properties.
     */
    static removePropertiesInDynamicObjects(data:PlainObject):PlainObject {
        for (const key:string in data)
            if (
                data.hasOwnProperty(key) &&
                !['__evaluate__', '__execute__'].includes(key) && (
                    data.hasOwnProperty('__evaluate__') ||
                    data.hasOwnProperty('__execute__'))
            )
                delete data[key]
            else if (typeof data[key] === 'object' && data[key] !== null)
                PluginAPI.removePropertiesInDynamicObjects(data[key])
        return data
    }
}
export default PluginAPI
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
