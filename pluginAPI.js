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
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
// endregion
/**
 * A dumm plugin interface with all available hooks.
 */
export default class PluginAPI {
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
        type:string, plugins:Array<Plugin>, configuration:Configuration,
        data:any = null, ...parameter:Array<any>
    ):Promise<any> {
        if (configuration.plugin.hotReloading && ![
            'configurationLoaded', 'apiFileReloaded'
        ].includes(type)) {
            const pluginsWithChangedConfiguration = PluginAPI.hotReloadFile(
                'configurationFile', 'configuration', plugins)
            if (pluginsWithChangedConfiguration.length) {
                PluginAPI.loadConfigurations(plugins, configuration)
                PluginAPI.callStack(
                    'configurationLoaded', plugins, configuration,
                    configuration, pluginsWithChangedConfiguration)
            }
            const pluginsWithChangedAPIFiles = PluginAPI.hotReloadFile(
                'apiFile', 'scope', plugins)
            if (pluginsWithChangedAPIFiles.length)
                PluginAPI.callStack(
                    'apiFileReloaded', plugins, configuration,
                    pluginsWithChangedConfiguration)
        }
        for (const plugin:Plugin of plugins) {
            if (plugin.api)
                try {
                    data = await plugin.api.call(
                        PluginAPI, type, data, ...parameter.concat([
                            configuration, plugins]))
                } catch (error) {
                    throw new Error(
                        `Plugin "${plugin.internalName}" throws: ` +
                        `${Tools.representObject(error)} during asynchrone ` +
                        `hook "${type}".`)
                }
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
        type:string, plugins:Array<Plugin>, configuration:Configuration,
        data:any = null, ...parameter:Array<any>
    ):any {
        for (const plugin:Plugin of plugins)
            if (plugin.api)
                try {
                    data = plugin.api.call(
                        PluginAPI, type, data, ...parameter.concat([
                            configuration, plugins]))
                } catch (error) {
                    throw new Error(
                        `Plugin "${plugin.internalName}" throws: ` +
                        `${Tools.representObject(error)} during synchrone ` +
                        `hook "${type}".`)
                }
        return data
    }
    /**
     * Checks for changed plugin file type in given plugins and reloads them
     * if necessary (new timestamp).
     * @param type - Plugin file type to search for updates.
     * @param targetType - Property name to in plugin meta informations to
     * update.
     * @param plugins - List of plugins to search for updates in.
     * @returns A list with plugins which have a changed plugin file of given
     * type.
     */
    static hotReloadFile(
        type:string, targetType:string, plugins:Array<Plugin>
    ):Array<Plugin> {
        const pluginsWithChangedFiles:Array<Plugin> = []
        for (const plugin:Plugin of plugins)
            if (plugin[type]) {
                const timestamp:number = fileSystem.statSync(
                    plugin[`${type}Path`]
                ).mtime.getTime()
                if (plugin[`${type}LoadTimestamp`] < timestamp) {
                    // Enforce to reload new file version.
                    /* eslint-disable no-eval */
                    delete eval('require').cache[eval('require').resolve(
                        plugin[type])]
                    /* eslint-enable no-eval */
                    plugin[targetType] = PluginAPI.loadFile(
                        plugin[type], plugin.name, plugin[targetType])
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
        name:string, internalName:string, plugins:{[key:string]:Plugin},
        configurationPropertyNames:Array<string>, pluginPath:string,
        encoding:string = 'utf8'
    ):Promise<Plugin> {
        let configurationFilePath:string = path.resolve(
            pluginPath, 'package.json')
        let packageConfiguration:?PlainObject = null
        if (configurationFilePath && await Tools.isDirectory(
            pluginPath
        ) && await Tools.isFile(configurationFilePath))
            packageConfiguration = PluginAPI.loadFile(
                configurationFilePath, name)
        if (packageConfiguration) {
            for (const propertyName:string of configurationPropertyNames)
                if (packageConfiguration.hasOwnProperty(propertyName)) {
                    let apiFilePath:string = 'index.js'
                    if (packageConfiguration.hasOwnProperty('main'))
                        apiFilePath = packageConfiguration.main
                    const pluginConfiguration:PlainObject =
                        packageConfiguration[propertyName]
                    pluginConfiguration.package = Tools.copyLimitedRecursively(
                        packageConfiguration, -1, null, true)
                    delete pluginConfiguration.package[propertyName]
                    return await PluginAPI.loadAPI(
                        apiFilePath, pluginPath, name, internalName, plugins,
                        encoding, pluginConfiguration, configurationFilePath)
                }
            throw new Error(
                `Plugin "${internalName}" ` +
                `${internalName === name ? '' : `(${name})`}hasn't working ` +
                `configuration object under one of the following keys: "` +
                `${configurationPropertyNames.join('", "')}".`)
        }
        return await PluginAPI.loadAPI(
            'index.js', pluginPath, name, internalName, plugins, encoding)
    }
    /**
     * Load given plugin api file in given plugin path generates a plugin
     * specific data structure with useful meta informations.
     * @param relativeFilePath - Path to file to load relatively from given
     * plugin path.
     * @param pluginPath - Path to plugin directory.
     * @param name - Plugin name to use for proper error messages.
     * @param internalName - Internal plugin name to use for proper error
     * messages.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param encoding - Encoding to use to read and write from child
     * process's.
     * @param configuration - Plugin specific configurations.
     * @param configurationFilePath - Plugin specific configuration file path.
     * standard in- and output.
     * @returns Plugin meta informations object.
     */
    static async loadAPI(
        relativeFilePath:string, pluginPath:string, name:string,
        internalName:string, plugins:{[key:string]:Object},
        encoding:string = 'utf8', configuration:?PlainObject = null,
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
                    return data
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
        for (const key:string in configuration)
            if (configuration.hasOwnProperty(key))
                delete configuration[key]
        Tools.extendObject(configuration, Tools.copyLimitedRecursively(
            baseConfiguration, -1, null, true))
        for (const plugin:Plugin of plugins)
            if (plugin.configuration) {
                const pluginConfiguration:PlainObject =
                    Tools.copyLimitedRecursively(
                        plugin.configuration, -1, null, true)
                delete pluginConfiguration.package
                Tools.extendObject(true, Tools.modifyObject(
                    configuration, pluginConfiguration
                ), pluginConfiguration)
            }
        const parameterDescription:Array<string> = [
            'currentPath', 'fileSystem', 'path', 'pluginAPI', 'require',
            'tools', 'webNodePath']
        const parameter:Array<any> = [
            /* eslint-disable no-eval */
            process.cwd(), fileSystem, path, PluginAPI, eval('require'), Tools,
            /* eslint-enable no-eval */
            __dirname]
        const packageConfiguration:PlainObject = configuration.package
        delete configuration.package
        configuration = Tools.resolveDynamicDataStructure(
            PluginAPI.removePropertiesInDynamicObjects(configuration),
            parameterDescription, parameter)
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
        filePath:string, name:string, fallbackScope:?Object = null,
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
        if (configuration.name !== 'webNode')
            plugins[configuration.name] = await PluginAPI.load(
                configuration.name, configuration.name, plugins,
                configuration.plugin.configurationPropertyNames,
                configuration.context.path, configuration.encoding)
        for (const type:string in configuration.plugin.directories)
            if (configuration.plugin.directories.hasOwnProperty(
                type
            ) && await Tools.isDirectory(
                configuration.plugin.directories[type].path
            )) {
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
                        pluginName, internalName, plugins,
                        configuration.plugin.configurationPropertyNames,
                        currentPluginPath, configuration.encoding)
                }
            }
        const temporaryPlugins:{[key:string]:Array<string>} = {}
        for (const pluginName:string in plugins)
            if (plugins.hasOwnProperty(pluginName))
                temporaryPlugins[plugins[
                    pluginName
                ].internalName] = plugins[pluginName].dependencies
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
            if (data.hasOwnProperty(key) && ![
                '__evaluate__', '__execute__'
            ].includes(key) && (
                data.hasOwnProperty('__evaluate__') ||
                data.hasOwnProperty('__execute__')
            ))
                delete data[key]
            else if (typeof data[key] === 'object' && data[key] !== null)
                PluginAPI.removePropertiesInDynamicObjects(data[key])
        return data
    }
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
