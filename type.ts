// #!/usr/bin/env node
// -*- coding: utf-8 -*-
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
import {Encoding, PlainObject} from 'clientnode/type'
// endregion
// region exports
export type MetaConfiguration = {
    fileNames:Array<string>;
    propertyNames:Array<string>;
}
export type WebNodeConfiguration = PlainObject & {
    context:{
        path:string;
        type:string;
    };
    debug:boolean;
    encoding:Encoding;
    interDependencies:PlainObject;
    name:string;
    package:PlainObject;
    plugin:{
        configuration:MetaConfiguration;
        directories:{
            internal:{
                path:string;
                nameRegularExpressionPattern:string;
            };
            external:{
                path:string;
                nameRegularExpressionPattern:string;
            };
        };
        hotReloading:boolean;
    };
}
export type PluginConfiguration = PlainObject & {
    dependencies?:Array<string>;
}
export type Configuration = WebNodeConfiguration & {
    [key:string]:PluginConfiguration;
}
export type Plugin = {
    api:Function|null;
    apiFilePaths:Array<string>;
    apiFileLoadTimestamps:Array<number>;
    configuration:PlainObject;
    configurationFilePaths:Array<string>;
    configurationFileLoadTimestamps:Array<number>;
    dependencies:Array<string>;
    internalName:string;
    name:string;
    path:string;
    scope:null|object;
}
export type PluginChange = {
    newScope:object;
    oldScope:null|object;
    plugin:Plugin;
    target:'configuration'|'scope';
}
export type Service = {name:string;promise:Promise<object>}
export type Services = {[key:string]:object}
export type ServicePromises = {[key:string]:Promise<object>}
export interface PluginHandler {
    /**
     * Triggered hook when at least one plugin has an api file which has been
     * changed and is reloaded. Asynchronous tasks are allowed and a returning
     * promise will be respected.
     * @param pluginsWithChangedAPIFiles - List of plugins which have a changed
     * plugin api file.
     * @returns Will be ignored.
     */
    apiFileReloaded?(pluginsWithChangedAPIFiles:Array<Plugin>):Array<Plugin>
    /**
     * Application has thrown an error and will be closed soon. Asynchronous
     * tasks are allowed and a returning promise will be respected.
     * @param error - An object with stored informations why an error occurs.
     * @param services - An object with stored service instances.
     * @returns Given and maybe changed object of services.
     */
    error?(error:object, services:Services):Services
    /**
     * Triggers if application will be closed immediately no asynchronous tasks
     * allowed anymore.
     * @param services - An object with stored service instances.
     * @returns Given and maybe changed object of services.
     */
    exit?(services:Services):Services
    /**
     * Application started, static configuration loaded and all available
     * plugins are determined and sorted in there dependency specific
     * typological order. Asynchronous tasks are allowed and a returning
     * promise will be respected.
     * @param configuration - Mutable by plugins extended configuration object.
     * extended by each plugin configuration.
     * @param plugins - Topological sorted list of plugins.
     * @returns Will be ignored.
     */
    initialize?(
        configuration:Configuration, plugins:Array<Plugin>
    ):Array<Plugin>
    /**
     * Plugins are initialized now and plugins should initialize their
     * continues running services (if they have one). Asynchronous tasks are
     * allowed and a returning promise will be respected.
     * @param services - An object with stored service instances.
     * @returns Given and maybe extended object of services.
     */
    preLoadService?(services:Services):Services
    /**
     * Plugins have initialized their continues running service and should
     * start them now. A Promise which observes this service should be
     * returned. Asynchronous tasks are allowed and a returning promise will be
     * respected NOTE: You have to wrap a promise in a promise if a continues
     * service should be registered.
     * @param servicePromises - An object with stored service promise
     * instances.
     * @param services - An object with stored service instances.
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    loadService?(servicePromises:ServicePromises, services:Services):Service
    /**
     * Plugins have launched their continues running services and returned a
     * corresponding promise which can be observed here.
     * @param servicePromises - An object with stored service promise
     * instances.
     * @param services - An object with stored service instances.
     * @returns Given and maybe extended object of services.
     */
    postLoadService?(
        servicePromises:ServicePromises, services:Services
    ):ServicePromises
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed. Asynchronous tasks are allowed
     * and a returning promise will be respected.
     * @param configuration - Updated configuration object.
     * @param pluginsWithChangedConfiguration - List of plugins which have a
     * changed plugin configuration.
     * @returns New configuration object to use.
     */
    preConfigurationLoaded?(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>
    ):Configuration
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed. Asynchronous tasks are allowed
     * and a returning promise will be respected.
     * @param configuration - Updated configuration object.
     * @param pluginsWithChangedConfiguration - List of plugins which have a
     * changed plugin configuration.
     * @returns New configuration object to use.
     */
    postConfigurationLoaded?(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>
    ):Configuration
    /**
     * Triggers if application will be closed soon. Asynchronous tasks are
     * allowed and a returning promise will be respected.
     * @param services - An object with stored service instances.
     * @returns Given and maybe changed object of services.
     */
    shouldExit?(services:Services):Services
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
