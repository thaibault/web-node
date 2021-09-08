// -*- coding: utf-8 -*-
/** @module type */
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
    Encoding, Mapping, PlainObject, RecursiveEvaluateable, RecursivePartial
} from 'clientnode/type'
// endregion
// region exports
export interface MetaConfiguration {
    fileNames:Array<string>
    propertyNames:Array<string>
}
/**
 * NOTE: This interface should be extended by plugins to specify their
 * configuration schema.
 * Can be recursive evaluateable.
 */
export interface PluginConfiguration {
    dependencies?:Array<string>
    name?:string
    package:PackageConfiguration
}
export interface EvaluateablePluginConfiguration extends PluginConfiguration {}
export interface WebNodeConfiguration extends PluginConfiguration {
    context:{
        path:string
        type:string
    }
    debug:boolean
    encoding:Encoding
    interDependencies:Mapping<Array<string>|string>
    plugin:{
        configuration:MetaConfiguration
        directories:Mapping<{
            nameRegularExpressionPattern:string
            path:string
        }>
        hotReloading:boolean
    }
    runtimeConfiguration?:EvaluateablePartialConfiguration
}
export type Configuration = WebNodeConfiguration & Mapping<PluginConfiguration>
export type EvaluateablePartialConfiguration =
    RecursiveEvaluateable<RecursivePartial<Configuration>>
export interface PackageConfiguration {
    documentationWebsite?:{name?:string}
    main?:string
    name:string
    webnode?:EvaluateablePartialConfiguration
    webNode?:EvaluateablePartialConfiguration
    'web-node'?:EvaluateablePartialConfiguration
}
export interface Plugin {
    api:Function|null
    apiFilePaths:Array<string>
    apiFileLoadTimestamps:Array<number>
    configuration:EvaluateablePluginConfiguration
    configurationFilePaths:Array<string>
    configurationFileLoadTimestamps:Array<number>
    dependencies:Array<string>
    internalName:string
    name:string
    packageConfiguration:PackageConfiguration
    path:string
    scope:null|object
}
export interface PluginChange {
    newScope:object
    oldScope:null|object
    plugin:Plugin
    target:'packageConfiguration'|'scope'
}
export interface Service {
    name:string
    promise:null|Promise<object>
}
export type Services = Mapping<object>
export type ServicePromises = Mapping<Promise<object>>
export interface PluginHandler {
    /**
     * Application started, static configuration loaded and all available
     * plugins are determined and sorted in there dependency specific
     * typological order. Asynchronous tasks are allowed and a returning
     * promise will be respected.
     *
     * @param configuration - Mutable configuration object. Extended by each
     * plugin specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Will be ignored.
     */
    initialize?(
        configuration:Configuration, plugins:Array<Plugin>
    ):Promise<Array<Plugin>>
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed. Asynchronous tasks are allowed
     * and a returning promise will be respected.
     *
     * @param configuration - Configuration object to update.
     * @param pluginsWithChangedConfiguration - List of plugins which have a
     * changed plugin configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns New configuration object to use.
     */
    preConfigurationLoaded?(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>,
        plugins:Array<Plugin>
    ):Promise<Configuration>
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed. Asynchronous tasks are allowed
     * and a returning promise will be respected.
     *
     * @param configuration - Updated configuration object.
     * @param pluginsWithChangedConfiguration - List of plugins which have a
     * changed plugin configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns New configuration object to use.
     */
    postConfigurationLoaded?(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>,
        plugins:Array<Plugin>
    ):Promise<Configuration>
    /**
     * Plugins are initialized now and plugins should initialize their
     * continues running services (if they have one). Asynchronous tasks are
     * allowed and a returning promise will be respected.
     *
     * @param services - An object with stored service instances.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Given and maybe extended object of services.
     */
    preLoadService?(
        services:Services, configuration:Configuration, plugins:Array<Plugin>
    ):Promise<Services>
    /**
     * Plugins are initialized now and plugins should initialize their
     * continues running services (if they have one). Asynchronous tasks are
     * allowed and a returning promise will be respected.
     *
     * @param services - An object with stored service instances.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Given and maybe extended object of services.
     */
    /*
    preLoad**PLUGIN_NAME**Service?(
        services:Services, configuration:Configuration, plugins:Array<Plugin>
    ):Promise<Services>
    */
    /**
     * Plugins have initialized their continues running service and should
     * start them now. A Promise which observes this service should be
     * returned. Asynchronous tasks are allowed and a returning promise will be
     * respected NOTE: You have to wrap a promise in a promise if a continues
     * service should be registered.
     *
     * @param servicePromises - An intermediate object with yet stored service
     * promise instances.
     * @param services - An object with stored service instances.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    loadService?(
        servicePromises:ServicePromises,
        services:Services,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<null|Service>
    /**
     * Plugins have launched their continues running services and returned a
     * corresponding promise which can be observed here.
     *
     * @param services - An object with stored service instances.
     * @param servicePromises - An object with stored service promise
     * instances.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Given and maybe extended object of services.
     */
    /*
    postLoad**PLUGIN_NAME**Service?(
        services:Services,
        servicePromises:ServicePromises,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<Services>
    */
    /**
     * Plugins have launched their continues running services and returned a
     * corresponding promise which can be observed here.
     *
     * @param servicePromises - An object with stored service promise
     * instances.
     * @param services - An object with stored service instances.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Given and maybe extended object of services.
     */
    postLoadService?(
        servicePromises:ServicePromises,
        services:Services,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<ServicePromises>
    /**
     * Triggered hook when at least one plugin has an api file which has been
     * changed and is reloaded. Asynchronous tasks are allowed and a returning
     * promise will be respected.
     *
     * @param pluginsWithChangedAPIFiles - List of plugins which have a changed
     * plugin api file.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Will be ignored.
     */
    apiFileReloaded?(
        pluginsWithChangedAPIFiles:Array<Plugin>,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<Array<Plugin>>
    /**
     * Application has thrown an error and will be closed soon. Asynchronous
     * tasks are allowed and a returning promise will be respected.
     *
     * @param error - An object with stored informations why an error occurs.
     * @param services - An object with stored service instances.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Given and maybe changed object of services.
     */
    error?(
        error:object,
        services:Services,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<Services>
    /**
     * Triggers if application will be closed soon. Asynchronous tasks are
     * allowed and a returning promise will be respected.
     *
     * @param services - An object with stored service instances.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Given and maybe changed object of services.
     */
    shouldExit?(
        services:Services, configuration:Configuration, plugins:Array<Plugin>
    ):Promise<Services>
    /**
     * Triggers if application will be closed immediately no asynchronous tasks
     * allowed anymore.
     *
     * @param services - An object with stored service instances.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Given and maybe changed object of services.
     */
    exit?(
        services:Services, configuration:Configuration, plugins:Array<Plugin>
    ):Services
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
