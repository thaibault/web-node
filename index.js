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
import Tools from 'clientnode'
import type {ProcedureFunction} from 'clientnode'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import baseConfiguration from './configurator'
import PluginAPI from './pluginAPI'
import type {Configuration, Plugin, Services} from './type'
// endregion
const main:ProcedureFunction = async ():Promise<any> => {
    // region load plugins
    const {plugins, configuration}:{
        configuration:Configuration;
        plugins:Array<Plugin>;
    } = await PluginAPI.loadALL(Tools.copyLimitedRecursively(
        baseConfiguration))
    await PluginAPI.callStack('initialize', plugins, configuration)
    if (plugins.length)
        console.info(
            'Loaded plugins: "' + plugins.map((plugin:Object):string =>
                plugin.internalName
            ).join('", "') + '".')
    for (const type:string of ['pre', 'post'])
        await PluginAPI.callStack(
            `${type}ConfigurationLoaded`, plugins, configuration,
            configuration, plugins.filter((plugin:Plugin):boolean =>
                Boolean(plugin.configurationFilePath)))
    // endregion
    let services:Services = {}
    try {
        // region start services
        for (const type:string of ['pre', 'post'])
            services = await PluginAPI.callStack(
                `${type}LoadService`, plugins, configuration, services)
        for (const serviceName:string in services)
            if (services.hasOwnProperty(serviceName))
                console.info(`Service ${serviceName} loaded.`)
        // endregion
        // region register close handler
        let finished:boolean = false
        const closeHandler:Function = async ():Promise<void> => {
            if (!finished)
                await PluginAPI.callStack(
                    'exit', plugins.slice().reverse(), configuration, services)
            finished = true
        }
        for (const closeEventName:string of Tools.closeEventNames)
            process.on(closeEventName, closeHandler)
        // endregion
    } catch (error) {
        try {
            await PluginAPI.callStack(
                'error', plugins, configuration, error, services)
        } catch (error) {
            if (configuration.debug)
                throw error
            else
                console.error(error)
        }
        if (configuration.debug)
            throw error
        else
            console.error(error)
    }
}
/* eslint-disable camelcase */
// IgnoreTypeCheck
if (require.main === module || typeof __webpack_require__ !== 'undefined')
/* eslint-enable camelcase */
    main()
export default main
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
