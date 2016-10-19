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
exports default Class {
    /**
     * Application started configuration loaded and all available plugins are
     * determined and sorted in there dependency specific typological order.
     * @param plugins - Topological sorted list of plugins.
     * @param baseConfiguration - Immutable base configuration which will be
     * extended by each plugin configuration.
     * @param configuration - Mutable by plugins extended configuration object.
     * @returns List of plugins in with needed order to run their hooks.
     */
    static preInitialize(plugins, baseConfiguration, configuration) {
        return plugins
    }
    /**
     * Database server launched and configured. Active database connection
     * given. Application server initialized and given as argument. Will be
     * listen on configured port after finishing this hook.
     * @param server - Application server instance.
     * @param databaseConnection - Active database connection.
     * @param databaseServerProcess - Node child process of database server.
     * @returns Applications server instance to listen on configured port.
     */
    static initialize(server, databaseConnection, databaseServerProcess) {
        return server
    }
    /**
     * Hook to run an each request. After running this hook returned request
     * will be finished.
     * @param request - Request which comes from client.
     * @param response - Response object to use to perform a response to
     * client.
     * @returns Request object to finishe.
     */
    static request(request, response) {
        return request
    }
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed.
     * @param configuration - Updated configuration object.
     * @param pluginsWithChangedConfiguration - List of plugins which have a
     * changed plugin configuration.
     * @returns New configuration object to use.
     */
    static configurationReloaded(
        configuration, pluginsWithChangedConfiguration
    ) {
        return configuration
    }
    /**
     * Triggered hook when at least one plugin has a new api file and has been
     * changed.
     * @param pluginsWithChangedAPIFiles - List of plugins which have a changed
     * plugin api file.
     * @returns Will be ignored.
     */
    static apiFileReloaded(pluginsWithChangedAPIFiles) {}
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
