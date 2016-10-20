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
import {ChildProcess} from 'child_process'
import PouchDB from 'pouchdb'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import type {Configuration, Plugin} from '../../type'
// endregion
/**
 * Dummy plugin interface implementing all available hooks.
 */
exports default class Dummy {
    /* eslint-disable no-unused-vars */
    /**
     * Application started, static configuration loaded and all available
     * plugins are determined and sorted in there dependency specific
     * typological order.
     * @param plugins - Topological sorted list of plugins.
     * @param baseConfiguration - Immutable base configuration which will be
     * extended by each plugin configuration.
     * @param configuration - Mutable by plugins extended configuration object.
     * @returns Will be ignored.
     */
    static preInitialize(
        plugins:Array<Plugin>, baseConfiguration:Configuration,
        configuration:Configuration
    ):Array<Plugin> {
        return plugins
    }
    /**
     * Database server launched and configured. Active database connection
     * given.
     * @param services - An object with stored service instances.
     * @param databaseConnection - Active database connection.
     * @param databaseServerProcess - Node child process of database server.
     * @returns Given and maybe extended object of services.
     */
    static postInitialize(
        services:Object, databaseConnection:PouchDB,
        databaseServerProcess:ChildProcess,
    ):Object {
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
