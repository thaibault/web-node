// #!/usr/bin/env node
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
// NOTE: Only needed for debugging this file.
import {Configuration, Plugin, ServicePromises, Services} from '../type'
// endregion
/**
 * Dummy plugin interface implementing all available hooks.
 */
export default class Dummy {
    /**
     * Triggered hook when at least one plugin has an api file which has been
     * changed and is reloaded. Asynchronous tasks are allowed and a returning
     * promise will be respected.
     * @param pluginsWithChangedAPIFiles - List of plugins which have a changed
     * plugin api file.
     * @returns Will be ignored.
     */
    static apiFileReloaded(pluginsWithChangedAPIFiles:Array<Plugin>):any {
        return pluginsWithChangedAPIFiles
    }
    /**
     * Application has thrown an error and will be closed soon. Asynchronous
     * tasks are allowed and a returning promise will be respected.
     * @param error - An object with stored informations why an error occurs.
     * @param services - An object with stored service instances.
     * @returns Given and maybe changed object of services.
     */
    static error(error:object, services:Services):Services {
        return services
    }
    /**
     * Triggers if application will be closed immediately no asynchronous tasks
     * allowed anymore.
     * @param services - An object with stored service instances.
     * @returns Given and maybe changed object of services.
     */
    static exit(services:Services):Services {
        return services
    }
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
    static initialize(
        configuration:Configuration, plugins:Array<Plugin>
    ):Array<Plugin> {
        return plugins
    }
    /**
     * Plugins are initialized now and plugins should initialize their
     * continues running services (if they have one). Asynchronous tasks are
     * allowed and a returning promise will be respected.
     * @param services - An object with stored service instances.
     * @returns Given and maybe extended object of services.
     */
    static preLoadService(services:Services):Services {
        return services
    }
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
    static loadService(
        servicePromises:ServicePromises, services:Services
    ):{name:string;promise:Promise<object>} {
        return {
            name: 'dummy',
            promise: new Promise((resolve:Function):void => resolve({}))
        }
    }
    /**
     * Plugins have launched their continues running services and returned a
     * corresponding promise which can be observed here.
     * @param servicePromises - An object with stored service promise
     * instances.
     * @param services - An object with stored service instances.
     * @returns Given and maybe extended object of services.
     */
    static postLoadService(
        servicePromises:ServicePromises, services:Services
    ):ServicePromises {
        return services
    }
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed. Asynchronous tasks are allowed
     * and a returning promise will be respected.
     * @param configuration - Updated configuration object.
     * @param pluginsWithChangedConfiguration - List of plugins which have a
     * changed plugin configuration.
     * @returns New configuration object to use.
     */
    static preConfigurationLoaded(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>
    ):Configuration {
        return configuration
    }
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed. Asynchronous tasks are allowed
     * and a returning promise will be respected.
     * @param configuration - Updated configuration object.
     * @param pluginsWithChangedConfiguration - List of plugins which have a
     * changed plugin configuration.
     * @returns New configuration object to use.
     */
    static postConfigurationLoaded(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>
    ):Configuration {
        return configuration
    }
    /**
     * Triggers if application will be closed soon. Asynchronous tasks are
     * allowed and a returning promise will be respected.
     * @param services - An object with stored service instances.
     * @returns Given and maybe changed object of services.
     */
    static shouldExit(services:Services):Services {
        return services
    }
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
