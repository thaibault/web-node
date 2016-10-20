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
// region  imports
import Tools from 'clientnode'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import baseConfiguration from './configurator'
import Helper from './helper'
import type {Configuration, Plugin, Services} from './type'
// endregion
(async ():Promise<any> => {
    // region load plugins
    const {plugins, configuration}:{
        plugins:Array<Plugin>;
        configuration:Configuration;
    } = Helper.loadPlugins(Tools.copyLimitedRecursively(baseConfiguration))
    await Helper.callPluginStack(
        'initialize', plugins, baseConfiguration, configuration)
    if (plugins.length)
        console.info(
            'Loaded plugins: "' + plugins.map((plugin:Object):string =>
                plugin.name
            ).join('", "') + '".')
    for (const type:string of ['pre', 'post'])
        await Helper.callPluginStack(
            `${type}ConfigurationLoaded`, plugins, baseConfiguration,
            configuration, configuration,
            plugins.filter((plugin:Plugin):boolean =>
                Boolean(plugin.configurationFilePath)))
    // endregion
    let services:Services = {}
    try {
        // region start services
        for (const type:string of ['pre', 'post'])
            services = await Helper.callPluginStack(
                `${type}LoadService`, plugins, baseConfiguration,
                configuration, services)
        for (const serviceName:string in services)
            if (services.hasOwnProperty(serviceName))
                console.info(`Service ${serviceName} loaded.`)
        // endregion
        // region register close handler
        let finished:boolean = false
        const closeHandler:Function = async ():Promise<void> => {
            if (!finished)
                await Helper.callPluginStack(
                    'exit', plugins, baseConfiguration, configuration,
                    services)
            finished = true
        }
        for (const closeEventName:string of Helper.closeEventNames)
            process.on(closeEventName, closeHandler)
        // endregion
    } catch (error) {
        await Helper.callPluginStack(
            'error', plugins, baseConfiguration, configuration, error, services
        )
        if (configuration.debug)
            throw error
        else
            console.error(error)
    }
})()
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
