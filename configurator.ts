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
import Tools, {currentRequire} from 'clientnode'
import {Mapping, RecursiveEvaluateable} from 'clientnode/type'
import fileSystem from 'fs'
import path from 'path'

import {
    Configuration,
    EvaluateConfigurationScope,
    EvaluateablePartialConfiguration,
    PackageConfiguration
} from './type'
import PluginAPI from './pluginAPI'
import webNodePackageConfiguration from './package.json'
// endregion
/*
    To assume to go two folder up from this file until there is no
    "node_modules" parent folder is usually resilient again dealing with
    projects where current working directory isn't the projects directory and
    this library is located as a nested dependency.
*/
webNodePackageConfiguration.webNode.core.context = {
    path: __dirname, type: 'relative'
}
while (true) {
    webNodePackageConfiguration.webNode.core.context.path = path.resolve(
        webNodePackageConfiguration.webNode.core.context.path, '../../'
    )
    if (
        path.basename(path.dirname(
            webNodePackageConfiguration.webNode.core.context.path)
        ) !== 'node_modules'
    )
        break
}
if (
    webNodePackageConfiguration.webNode.core.context.path === '/' ||
    path.basename(path.dirname(process.cwd())) === 'node_modules' ||
    path.basename(path.dirname(process.cwd())) === '.staging' &&
    path.basename(path.dirname(path.dirname(process.cwd()))) === 'node_modules'
)
    /*
        NOTE: If we are dealing was a dependency project use current directory
        as context.
    */
    webNodePackageConfiguration.webNode.core.context.path = process.cwd()
else
    /*
        NOTE: If the current working directory references this file via a
        linked "node_modules" folder using current working directory as context
        is a better assumption than two folders up the hierarchy.
    */
    try {
        if (
            fileSystem.lstatSync(path.join(process.cwd(), 'node_modules'))
                .isSymbolicLink()
        )
            webNodePackageConfiguration.webNode.core.context.path =
                process.cwd()
    } catch (error) {
        // Ignore error.
    }

let mainPackageConfiguration:PackageConfiguration = {name: 'main'}
try {
    mainPackageConfiguration = currentRequire!(path.join(
        webNodePackageConfiguration.webNode.core.context.path, 'package'
    )) as PackageConfiguration
} catch (error) {
    webNodePackageConfiguration.webNode.core.context.path = process.cwd()
}

const name:string =
    mainPackageConfiguration.documentationWebsite?.name ||
    mainPackageConfiguration.name ||
    'main'

const applicationConfiguration:EvaluateablePartialConfiguration =
    mainPackageConfiguration.webNode ||
    {[name]: {
        name,
        package: mainPackageConfiguration
    }}
// endregion
webNodePackageConfiguration.webNode.core.name =
    webNodePackageConfiguration.documentationWebsite.name
const now:Date = new Date()
const scope:EvaluateConfigurationScope = {
    currentPath: process.cwd(),
    fileSystem,
    path,
    PluginAPI,
    require: currentRequire!,
    Tools,
    webNodePath: __dirname,
    now,
    nowUTCTimestamp: Tools.numberGetUTCTimestamp(now)
}
export let configuration:Configuration =
    Tools.evaluateDynamicData<Configuration>(
        webNodePackageConfiguration.webNode as
            unknown as
            RecursiveEvaluateable<Configuration>,
        scope as unknown as Mapping<unknown>
    )

delete (webNodePackageConfiguration as unknown as PackageConfiguration).webNode

Tools.extend<Configuration>(
    true,
    Tools.modifyObject<Configuration>(
        configuration, applicationConfiguration
    )!,
    applicationConfiguration as Configuration
)

if (process.argv.length > 2) {
    const result:null|EvaluateablePartialConfiguration =
        Tools.stringParseEncodedObject<EvaluateablePartialConfiguration>(
            process.argv[process.argv.length - 1],
            configuration,
            'configuration'
        )

    if (Tools.isPlainObject(result)) {
        Tools.extend<RecursiveEvaluateable<Configuration>>(
            true,
            /*
                NOTE: "Tools.modifyObject" removes modifications in "result"
                in-place before it is used as extending source.
            */
            Tools.modifyObject<Configuration>(configuration, result)!,
            result as RecursiveEvaluateable<Configuration>
        )
        configuration.core.runtimeConfiguration = result
    }
}

configuration = Tools.evaluateDynamicData<Configuration>(
    Tools.removeKeysInEvaluation<Configuration>(configuration),
    scope as unknown as Mapping<unknown>
)
configuration.name = name
configuration.core.package =
    webNodePackageConfiguration as unknown as PackageConfiguration

export default configuration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
