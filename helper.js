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
import fileSystem from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import type {Configuration, Plugin} from './type'
import WebOptimizerHelper from 'weboptimizer/helper'
import type {PlainObject} from 'weboptimizer/type'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
// endregion
// region methods
/**
 * A dumm plugin interface with all available hooks.
 * @property static:closeEventNames - Process event names which indicates that
 * a process has finished.
 */
export default class Helper {
    static closeEventNames:Array<string> = [
        'exit', 'close', 'uncaughtException', 'SIGINT', 'SIGTERM', 'SIGQUIT']
    // region tools
    /**
     * Checks if given url response with given status code.
     * @param url - Url to check reachability.
     * @param wait - Boolean indicating if we should retry until a status code
     * will be given.
     * @param expectedStatusCode - Status code to check for.
     * @param pollIntervallInSeconds - Seconds between two tries to reach given
     * url.
     * @param timeoutInSeconds - Delay after assuming given resource isn't
     * available if no response is coming.
     * @returns A promise which will be resolved if a request to given url has
     * finished and resulting status code matches given expectedstatus code.
     * Otherwise returned promise will be rejected.
     *
     */
    static async checkReachability(
        url:string, wait:boolean = false, expectedStatusCode:number = 200,
        pollIntervallInSeconds:number = 0.1, timeoutInSeconds:number = 10
    ):Promise<?Object> {
        const check:Function = (response:?Object):?Object => {
            if (
                response && 'status' in response &&
                response.status !== expectedStatusCode
            )
                throw new Error(
                    `Given status code ${response.status} differs from ` +
                    `${expectedStatusCode}.`)
            return response
        }
        if (wait)
            return new Promise((resolve:Function, reject:Function):void => {
                let timedOut:boolean = false
                const wrapper:Function = async ():Promise<?Object> => {
                    let response:Object
                    try {
                        response = await fetch(url)
                    } catch (error) {
                        if (!timedOut)
                            /* eslint-disable no-use-before-define */
                            currentlyRunningTimeout = setTimeout(
                                wrapper, pollIntervallInSeconds * 1000)
                            /* eslint-enable no-use-before-define */
                        return response
                    }
                    try {
                        resolve(check(response))
                    } catch (error) {
                        reject(error)
                    } finally {
                        /* eslint-disable no-use-before-define */
                        clearTimeout(timeoutID)
                        /* eslint-enable no-use-before-define */
                    }
                    return response
                }
                let currentlyRunningTimeout = setTimeout(wrapper, 0)
                const timeoutID:number = setTimeout(():void => {
                    timedOut = true
                    clearTimeout(currentlyRunningTimeout)
                    reject('timeout')
                }, timeoutInSeconds * 1000)
            })
        return check(await fetch(url))
    }
    /**
     * Represents given object as formatted string.
     * @param object - Object to Represents.
     * @returns Representation string.
     */
    static representObject(object:any):string {
        return JSON.stringify(object, null, 4)
    }
    // endregion
    // region plugin
    /**
     * Calls all plugin methods for given trigger description.
     * @param type - Type of trigger.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param baseConfiguration - Immutable base configuration.
     * @param configuration - Plugin extendable configuration object.
     * @param data - Data to pipe throw all plugins and resolve after all
     * plugins have been resolved.
     * @param parameter - Additional parameter to forward into plugin api.
     * @returns A promise which resolves when all callbacks have resolved their
     * promise.
     */
    static async callPluginStack(
        type:string, plugins:Array<Object>, baseConfiguration:Configuration,
        configuration:Configuration, data:any = null, ...parameter:Array<any>
    ):Promise<any> {
        if (configuration.plugin.hotReloading) {
            const pluginsWithChangedConfiguration = Helper.hotReloadPluginFile(
                'configurationFile', 'configuration', plugins)
            if (pluginsWithChangedConfiguration.length) {
                Helper.loadPluginConfigurations(
                    plugins, configuration, baseConfiguration)
                Helper.callPluginStack(
                    'configurationLoaded', plugins, configuration,
                    baseConfiguration, configuration,
                    pluginsWithChangedConfiguration)
            }
            const pluginsWithChangedAPIFiles = Helper.hotReloadPluginFile(
                'apiFile', 'scope', plugins)
            if (pluginsWithChangedAPIFiles.length)
                Helper.callPluginStack(
                    'apiFileReloaded', plugins, configuration,
                    baseConfiguration, pluginsWithChangedConfiguration)
        }
        for (const plugin:Object of plugins)
            data = await plugin.api.call(
                Helper, type, data, ...parameter.concat([
                    plugins, configuration, baseConfiguration]))
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
    static hotReloadPluginFile(
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
                    plugin[targetType] = Helper.loadPluginFile(
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
     * @param plugins - List of all yet determined plugin informations.
     * @param configurationPropertyNames - Property names to search for to use
     * as entry in plugin configuration file.
     * @param pluginPath - Path to given plugin.
     * @returns An object of plugin specific meta informations.
     */
    static loadPlugin(
        name:string, plugins:{[key:string]:Plugin},
        configurationPropertyNames:Array<string>, pluginPath:string
    ):Plugin {
        let configurationFilePath:string = path.resolve(
            pluginPath, 'package.json')
        let packageConfiguration:?PlainObject = null
        if (configurationFilePath && WebOptimizerHelper.isDirectorySync(
            pluginPath
        ) && WebOptimizerHelper.isFileSync(configurationFilePath))
            packageConfiguration = Helper.loadPluginFile(
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
                    return Helper.loadPluginAPI(
                        apiFilePath, pluginPath, name, plugins,
                        pluginConfiguration, configurationFilePath)
                }
            throw new Error(
                `Plugin "${name}" hasn't working configuration object under ` +
                `one of the following keys: "` +
                `${configurationPropertyNames.join('", "')}".`)
        }
        return Helper.loadPluginAPI('index.js', pluginPath, name, plugins)
    }
    /**
     * Load given plugin api file in given plugin path generates a plugin
     * specific data structure with useful meta informations.
     * @param relativeFilePath - Path to file to load relatively from given
     * plugin path.
     * @param pluginPath - Path to plugin directory.
     * @param name - Plugin name to use for proper error messages.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param configuration - Plugin specific configurations.
     * @param configurationFilePath - Plugin specific configuration file path.
     * @returns Plugin meta informations object.
     */
    static loadPluginAPI(
        relativeFilePath:string, pluginPath:string, name:string,
        plugins:{[key:string]:Object}, configuration:?PlainObject = null,
        configurationFilePath:?string = null
    ):Plugin {
        let filePath:string = path.resolve(pluginPath, relativeFilePath)
        if (!WebOptimizerHelper.isFileSync(filePath))
            for (const fileName:string of fileSystem.readdirSync(pluginPath))
                if (
                    fileName !== 'package.json' &&
                    WebOptimizerHelper.isFileSync(path.resolve(
                        pluginPath, fileName
                    ))
                ) {
                    filePath = path.resolve(pluginPath, filePath)
                    if (['index', 'main'].includes(path.basename(
                        filePath, path.extname(fileName)
                    )))
                        break
                }
        let api:?Function = null
        if (WebOptimizerHelper.isFileSync(filePath))
            if (filePath.endsWith('.js'))
                api = async (type:string, ...parameter:Array<any>):any => {
                    if (type in plugins[name].scope)
                        return await plugins[name].scope[type](...parameter)
                }
            else
                api = (...parameter:Array<any>):Promise<any> => new Promise((
                    resolve:Function, reject:Function
                ):void => {
                    const childProcess:ChildProcess = spawnChildProcess(
                        filePath, Tools.arrayMake(parameter), {
                            cwd: process.cwd(),
                            env: process.env,
                            shell: true,
                            stdio: 'inherit'
                        })
                    for (const closeEventName:string of Helper.closeEventNames)
                        childProcess.on(
                            closeEventName,
                            WebOptimizerHelper.getProcessCloseHandler(
                                resolve, reject, closeEventName))
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
            name,
            path: pluginPath,
            scope: api && Helper.loadPluginFile(filePath, name)
        }
    }
    /**
     * Loads given plugin configurations into global configuration.
     * @param plugins - Topological sorted list of plugins to check for
     * configurations.
     * @param configuration - Global configuration to extend with.
     * @param baseConfiguration - Global configuration to use as source.
     * @returns Updated given configuration object.
     */
    static loadPluginConfigurations(
        plugins:Array<Plugin>, configuration:Configuration,
        baseConfiguration:?Configuration
    ):Configuration {
        if (baseConfiguration) {
            for (const key:string in configuration)
                if (configuration.hasOwnProperty(key))
                    delete configuration[key]
            Tools.extendObject(configuration, baseConfiguration)
        }
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
            'self', 'webNodePath', 'currentPath', 'path', 'helper', 'tools',
            'plugins']
        const parameter:Array<any> = [
            configuration, __dirname, process.cwd(), path, Helper, Tools,
            plugins]
        return Tools.unwrapProxy(Tools.resolveDynamicDataStructure(
            configuration, parameterDescription, parameter))
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
    static loadPluginFile(
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
                        `plugin "${name}": ${Helper.representObject(error)}.` +
                        ` Using fallback one.`)
            } else
                throw new Error(
                    `Couln't load plugin file "${filePath}" for plugin "` +
                    `${name}": ${Helper.representObject(error)}`)
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
    static loadPlugins(configuration:Configuration):{
        configuration:Configuration;
        plugins:Array<Plugin>
    } {
        const plugins:{[key:string]:Object} = {}
        for (const type:string in configuration.plugin.directories)
            if (configuration.plugin.directories.hasOwnProperty(
                type
            ) && WebOptimizerHelper.isDirectorySync(
                configuration.plugin.directories[type].path
            ))
                fileSystem.readdirSync(
                    configuration.plugin.directories[type].path
                ).forEach((pluginName:string):void => {
                    if (!(new RegExp(configuration.plugin.directories[
                        type
                    ].nameRegularExpressionPattern)).test(pluginName))
                        return
                    const currentPluginPath:string = path.resolve(
                        configuration.plugin.directories[type].path, pluginName
                    )
                    plugins[pluginName] = Helper.loadPlugin(
                        pluginName, plugins,
                        configuration.plugin.configurationPropertyNames,
                        currentPluginPath)
                })
        const sortedPlugins:Array<Plugin> = []
        const temporaryPlugins:{[key:string]:Array<string>} = {}
        for (const pluginName:string in plugins)
            if (plugins.hasOwnProperty(pluginName))
                if (plugins[pluginName].hasOwnProperty('dependencies'))
                    temporaryPlugins[pluginName] = plugins[
                        pluginName
                    ].dependencies
                else
                    temporaryPlugins[pluginName] = []
        for (const pluginName:string of Tools.arraySortTopological(
            temporaryPlugins
        ))
            sortedPlugins.push(plugins[pluginName])
        return {
            plugins: sortedPlugins,
            configuration: Helper.loadPluginConfigurations(
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
