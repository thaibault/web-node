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
import Tools from 'clientnode'
import {
    Mapping, PlainObject, RecursiveEvaluateable, RecursivePartial
} from 'clientnode/type'
import fileSystem from 'fs'
import path from 'path'

import {
    Configuration, EvaluateablePartialConfiguration, PackageConfiguration
} from './type'
import PluginAPI from './pluginAPI'
import packageConfiguration from './package.json'
// endregion
/*
    To assume to go two folder up from this file until there is no
    "node_modules" parent folder is usually resilient again dealing with
    projects where current working directory isn't the projects directory and
    this library is located as a nested dependency.
*/
packageConfiguration.webNode.context = {path: __dirname}
while (true) {
    packageConfiguration.webNode.context.path =
        path.resolve(packageConfiguration.webNode.context.path, '../../')
    if (
        path.basename(path.dirname(
            packageConfiguration.webNode.context.path)
        ) !== 'node_modules'
    )
        break
}
if (
    packageConfiguration.webNode.context.path === '/' ||
    path.basename(path.dirname(process.cwd())) === 'node_modules' ||
    path.basename(path.dirname(process.cwd())) === '.staging' &&
    path.basename(path.dirname(path.dirname(process.cwd()))) === 'node_modules'
)
    /*
        NOTE: If we are dealing was a dependency project use current directory
        as context.
    */
    packageConfiguration.webNode.context.path = process.cwd()
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
            packageConfiguration.webNode.context.path = process.cwd()
    } catch (error) {}

let mainConfiguration:PackageConfiguration = {name: 'main'}
try {
    /* eslint-disable no-eval */
    mainConfiguration = eval('require')(
        path.join(packageConfiguration.webNode.context.path, 'package')
    )
    /* eslint-enable no-eval */
} catch (error) {
    packageConfiguration.webNode.context.path = process.cwd()
}

const name:string =
    mainConfiguration.documentationWebsite?.name ||
    mainConfiguration.name

const applicationConfiguration:EvaluateablePartialConfiguration =
    mainConfiguration.webNode || {}

if (name)
    applicationConfiguration.name = name
// endregion
packageConfiguration.webNode.name =
    packageConfiguration.documentationWebsite.name
const now:Date = new Date()
const scope:Mapping<any> = {
    currentPath: process.cwd(),
    fileSystem,
    path,
    PluginAPI,
    /* eslint-disable no-eval */
    require: eval('require'),
    /* eslint-enable no-eval */
    Tools,
    webNodePath: __dirname,
    now,
    nowUTCTimestamp: Tools.numberGetUTCTimestamp(now)
}
export let configuration:Configuration =
    Tools.evaluateDynamicData<Configuration>(
        packageConfiguration.webNode, scope
    )

delete packageConfiguration.webNode

Tools.extend<Configuration>(
    true,
    Tools.modifyObject<Configuration>(
        configuration, applicationConfiguration
    )!,
    applicationConfiguration as Configuration
)

if (process.argv.length > 2) {
    const result:null|RecursivePartial<Configuration> =
        Tools.stringParseEncodedObject<RecursivePartial<Configuration>>(
            process.argv[process.argv.length - 1],
            configuration,
            'configuration'
        )

    if (Tools.isPlainObject(result)) {
        Tools.extend<Configuration>(
            true,
            Tools.modifyObject<Configuration>(configuration, result)!,
            result
        )
        configuration.runtimeConfiguration = result
    }
}

configuration = Tools.evaluateDynamicData<Configuration>(
    Tools.removeKeysInEvaluation<Configuration>(configuration), scope
)
configuration.package = packageConfiguration as unknown as PackageConfiguration
/*
    NOTE: We need to copy the configuration to avoid operating on de-duplicated
    objects in further resolving algorithms which can lead to unexpected
    errors.
*/
configuration = Tools.copy(configuration, -1, true)
export default configuration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
