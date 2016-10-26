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
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import type {Configuration, Plugin, Services} from '../type'
// endregion
/**
 * Dummy plugin interface implementing all available hooks.
 */
export default class Dummy {
    /* eslint-disable no-unused-vars */
    /**
     * Application will be closed soon.
     * @param error - An object with stored informations why an error occurs.
     * @param services - An object with stored service instances.
     * @returns Given and maybe changed object of services.
     */
    static error(error:Object, services:Services):Services {
        return services
    }
    /**
     * Application will be closed soon.
     * @param services - An object with stored service instances.
     * @returns Given and maybe changed object of services.
     */
    static exit(services:Services):Services {
        return services
    }
    /**
     * Application started, static configuration loaded and all available
     * plugins are determined and sorted in there dependency specific
     * typological order.
     * @param plugins - Topological sorted list of plugins.
     * @param configuration - Mutable by plugins extended configuration object.
     * extended by each plugin configuration.
     * @returns Will be ignored.
     */
    static initialize(
        plugins:Array<Plugin>, configuration:Configuration
    ):Array<Plugin> {
        return plugins
    }
    /**
     * Plugins initialized and plugins should start to initialize their
     * services.
     * @param services - An object with stored service instances.
     * @returns Given and maybe extended object of services.
     */
    static preLoadService(services:Services):Services {
        return services
    }
    /**
     * Plugins initialized and plugins have start to initialize their services.
     * @param services - An object with stored service instances.
     * @returns Given and maybe extended object of services.
     */
    static postLoadService(services:Services):Services {
        return services
    }
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed.
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
     * configuration object has been changed.
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
     * Triggered hook when at least one plugin has a new api file and has been
     * changed.
     * @param pluginsWithChangedAPIFiles - List of plugins which have a changed
     * plugin api file.
     * @returns Will be ignored.
     */
    static preAPIFileReloaded(pluginsWithChangedAPIFiles:Array<Plugin>):any {
        return pluginsWithChangedAPIFiles
    }
    /**
     * Triggered hook when at least one plugin has a new api file and has been
     * changed.
     * @param pluginsWithChangedAPIFiles - List of plugins which have a changed
     * plugin api file.
     * @returns Will be ignored.
     */
    static postAPIFileReloaded(pluginsWithChangedAPIFiles:Array<Plugin>):any {
        return pluginsWithChangedAPIFiles
    }
    /* eslint-enable no-unused-vars */
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
