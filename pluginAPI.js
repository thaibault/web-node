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
import {ChildProcess, spawn as spawnChildProcess} from 'child_process'
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
// region methods
/**
 * A dumm plugin interface with all available hooks.
 */
export default class PluginAPI {
    // region plugin
    /**
     * Calls all plugin methods for given trigger description.
     * @param type - Type of trigger.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param configuration - Plugin extendable configuration object.
     * @param data - Data to pipe throw all plugins and resolve after all
     * plugins have been resolved.
     * @param parameter - Additional parameter to forward into plugin api.
     * @returns A promise which resolves when all callbacks have resolved their
     * promise.
     */
    static async callStack(
        type:string, plugins:Array<Object>, configuration:Configuration,
        data:any = null, ...parameter:Array<any>
    ):Promise<any> {
        if (configuration.plugin.hotReloading) {
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
        for (const plugin:Object of plugins)
            if (plugin.api)
                data = await plugin.api.call(
                    PluginAPI, type, data, ...parameter.concat([
                        configuration, plugins]))
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
     * @returns An object of plugin specific meta informations.
     */
    static load(
        name:string, internalName:string, plugins:{[key:string]:Plugin},
        configurationPropertyNames:Array<string>, pluginPath:string
    ):Plugin {
        let configurationFilePath:string = path.resolve(
            pluginPath, 'package.json')
        let packageConfiguration:?PlainObject = null
        if (configurationFilePath && Tools.isDirectorySync(
            pluginPath
        ) && Tools.isFileSync(configurationFilePath))
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
                        packageConfiguration)
                    delete pluginConfiguration.package[propertyName]
                    return PluginAPI.loadAPI(
                        apiFilePath, pluginPath, name, internalName, plugins,
                        pluginConfiguration, configurationFilePath)
                }
            throw new Error(
                `Plugin "${internalName} (${name})" hasn't working ` +
                `configuration object under one of the following keys: "` +
                `${configurationPropertyNames.join('", "')}".`)
        }
        return PluginAPI.loadAPI(
            'index.js', pluginPath, name, internalName, plugins)
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
     * @param configuration - Plugin specific configurations.
     * @param configurationFilePath - Plugin specific configuration file path.
     * @returns Plugin meta informations object.
     */
    static loadAPI(
        relativeFilePath:string, pluginPath:string, name:string,
        internalName:string, plugins:{[key:string]:Object},
        configuration:?PlainObject = null,
        configurationFilePath:?string = null
    ):Plugin {
        let filePath:string = path.resolve(pluginPath, relativeFilePath)
        if (!Tools.isFileSync(filePath))
            for (const fileName:string of fileSystem.readdirSync(pluginPath))
                if (fileName !== 'package.json' && Tools.isFileSync(
                    path.resolve(pluginPath, fileName)
                )) {
                    filePath = path.resolve(pluginPath, filePath)
                    if (['index', 'main'].includes(path.basename(
                        filePath, path.extname(fileName)
                    )))
                        break
                }
        let api:?Function = null
        if (Tools.isFileSync(filePath))
            if (filePath.endsWith('.js')) {
                api = async (
                    type:string, data:any, ...parameter:Array<any>
                ):any => {
                    if (type in plugins[name].scope)
                        return await plugins[name].scope[type](
                            data, ...parameter)
                    return data
                }
            } else
                api = (
                    data:any, ...parameter:Array<any>
                ):Promise<any> => new Promise((
                    resolve:Function, reject:Function
                ):void => {
                    const childProcess:ChildProcess = spawnChildProcess(
                        filePath, Tools.arrayMake(parameter), {
                            cwd: process.cwd(),
                            env: process.env,
                            shell: true,
                            stdio: 'inherit'
                        })
                    for (const closeEventName:string of Tools.closeEventNames)
                        childProcess.on(
                            closeEventName,
                            Tools.getProcessCloseHandler(
                                resolve, reject, closeEventName))
                    // TODO check how data could by manipulated.
                    return data
                })
        return {
            api,
            apiFilePath: api && filePath,
            apiFileLoadTimestamp: api && fileSystem.statSync(
                filePath
            ).mtime.getTime(),
            configuration,
            configurationFilePath,
            configurationFileLoadTimestamp: configurationFilePath &&
                fileSystem.statSync(configurationFilePath).mtime.getTime() ||
                null,
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
        Tools.extendObject(configuration, baseConfiguration)
        for (const plugin:Plugin of plugins)
            if (plugin.configuration) {
                const pluginConfiguration:PlainObject =
                    Tools.copyLimitedRecursively(plugin.configuration)
                delete pluginConfiguration.package
                Tools.extendObject(true, Tools.modifyObject(
                    configuration, pluginConfiguration
                ), pluginConfiguration)
            }
        const parameterDescription:Array<string> = [
            'currentPath', 'fileSystem', 'path', 'pluginAPI', 'require',
            'self', 'tools', 'webNodePath']
        const parameter:Array<any> = [
            /* eslint-disable no-eval */
            process.cwd(), fileSystem, path, PluginAPI, eval('require'),
            /* eslint-enable no-eval */
            configuration, Tools, __dirname]
        const packageConfiguration:PlainObject = configuration.package
        delete configuration.package
        configuration = Tools.unwrapProxy(Tools.resolveDynamicDataStructure(
            configuration, parameterDescription, parameter))
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
                        `plugin "${name}": ${Tools.representObject(error)}.` +
                        ` Using fallback one.`)
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
    static loadALL(configuration:Configuration):{
        configuration:Configuration;
        plugins:Array<Plugin>
    } {
        const plugins:{[key:string]:Object} = {}
        if (configuration.name !== 'webNode')
            plugins[configuration.name] = PluginAPI.load(
                configuration.name, configuration.name, plugins,
                configuration.plugin.configurationPropertyNames,
                configuration.context.path)
        for (const type:string in configuration.plugin.directories)
            if (configuration.plugin.directories.hasOwnProperty(
                type
            ) && Tools.isDirectorySync(
                configuration.plugin.directories[type].path
            ))
                for (const pluginName:string of fileSystem.readdirSync(
                    configuration.plugin.directories[type].path
                )) {
                    const compiledRegularExpression:RegExp = new RegExp(
                        configuration.plugin.directories[
                            type
                        ].nameRegularExpressionPattern)
                    if (!(compiledRegularExpression).test(pluginName))
                        break
                    const currentPluginPath:string = path.resolve(
                        configuration.plugin.directories[type].path, pluginName
                    )
                    const internalName:string = pluginName.replace(
                        compiledRegularExpression, (
                            fullMatch:string, firstMatch:string|number
                        ):string => (
                            typeof firstMatch === 'string'
                        ) ? firstMatch : fullMatch)
                    plugins[pluginName] = PluginAPI.load(
                        pluginName, internalName, plugins,
                        configuration.plugin.configurationPropertyNames,
                        currentPluginPath)
                }
        const sortedPlugins:Array<Plugin> = []
        const temporaryPlugins:{[key:string]:Array<string>} = {}
        for (const pluginName:string in plugins)
            if (plugins.hasOwnProperty(pluginName))
                if (plugins[pluginName].hasOwnProperty('dependencies'))
                    temporaryPlugins[plugins[
                        pluginName
                    ].internalName] = plugins[pluginName].dependencies
                else
                    temporaryPlugins[plugins[pluginName].internalName] = []
        for (const pluginName:string of Tools.arraySortTopological(
            temporaryPlugins
        ))
            sortedPlugins.push(plugins[pluginName])
        return {
            plugins: sortedPlugins,
            configuration: PluginAPI.loadConfigurations(
                sortedPlugins, configuration)
        }
    }
    // endregion
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
