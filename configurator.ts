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
import {
    currentRequire,
    evaluateDynamicData,
    extend,
    getUTCTimestamp,
    isPlainObject,
    Mapping,
    MAXIMAL_NUMBER_OF_ITERATIONS,
    modifyObject,
    parseEncodedObject,
    RecursiveEvaluateable,
    removeKeysInEvaluation,
    UTILITY_SCOPE
} from 'clientnode'
import fileSystemSynchronous, {lstatSync} from 'fs'
import path, {basename, dirname, join, resolve} from 'path'

import {
    Configuration,
    EvaluateConfigurationScope,
    EvaluateablePartialConfiguration,
    PackageConfiguration
} from './type'
import webNodePackageConfiguration from './package.json'
import pluginAPI from './pluginAPI'
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
for (
    let iteration = 0;
    iteration < MAXIMAL_NUMBER_OF_ITERATIONS.value;
    iteration++
) {
    webNodePackageConfiguration.webNode.core.context.path = resolve(
        webNodePackageConfiguration.webNode.core.context.path, '../../'
    )
    if (
        basename(dirname(
            webNodePackageConfiguration.webNode.core.context.path)
        ) !== 'node_modules'
    )
        break
}
if (
    webNodePackageConfiguration.webNode.core.context.path === '/' ||
    basename(dirname(process.cwd())) === 'node_modules' ||
    basename(dirname(process.cwd())) === '.staging' &&
    basename(dirname(dirname(process.cwd()))) === 'node_modules'
)
    /*
        NOTE: If we are dealing was a dependent project use current directory
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
        if (lstatSync(join(process.cwd(), 'node_modules')).isSymbolicLink())
            webNodePackageConfiguration.webNode.core.context.path =
                process.cwd()
    } catch {
        // Ignore error.
    }

let mainPackageConfiguration: PackageConfiguration = {name: 'main'}
try {
    // @ts-expect-error "currentRequire" may not be set.
    mainPackageConfiguration = currentRequire(join(
        webNodePackageConfiguration.webNode.core.context.path, 'package'
    )) as PackageConfiguration
} catch {
    webNodePackageConfiguration.webNode.core.context.path = process.cwd()
}

const name: string =
    mainPackageConfiguration.documentationWebsite?.name ||
    mainPackageConfiguration.name ||
    'main'

const applicationConfiguration: EvaluateablePartialConfiguration =
    mainPackageConfiguration.webNode ||
    {[name]: {
        name,
        package: mainPackageConfiguration
    }}
// endregion
webNodePackageConfiguration.webNode.core.name =
    webNodePackageConfiguration.documentationWebsite.name
const now: Date = new Date()
const scope: EvaluateConfigurationScope = {
    ...UTILITY_SCOPE,
    currentPath: process.cwd(),
    fs: fileSystemSynchronous,
    path,
    pluginAPI,
    webNodePath: __dirname,
    now,
    nowUTCTimestamp: getUTCTimestamp(now)
}
export let configuration: Configuration =
    evaluateDynamicData<Configuration>(
        webNodePackageConfiguration.webNode as
            unknown as
            RecursiveEvaluateable<Configuration>,
        scope as unknown as Mapping<unknown>
    )

delete (webNodePackageConfiguration as unknown as PackageConfiguration).webNode

extend<Configuration>(
    true,
    modifyObject<Configuration>(configuration, applicationConfiguration),
    applicationConfiguration as Configuration
)

const result = {}
for (const argument of process.argv.slice(1)) {
    const subResult: EvaluateablePartialConfiguration | null =
        parseEncodedObject<EvaluateablePartialConfiguration>(
            argument, configuration, 'configuration'
        )
    if (isPlainObject(subResult))
        extend(true, result, subResult)
}
if (Object.keys(result).length > 0) {
    extend<RecursiveEvaluateable<Configuration>>(
        true,
        /*
            NOTE: "object.modifyObject" removes modifications in "result"
            in-place before it is used as extending source.
        */
        modifyObject<Configuration>(configuration, result),
        result as RecursiveEvaluateable<Configuration>
    )
    configuration.core.runtimeConfiguration = result
}

configuration = evaluateDynamicData<Configuration>(
    removeKeysInEvaluation<Configuration>(configuration),
    scope as unknown as Mapping<unknown>
)
configuration.name = name
configuration.core.package =
    webNodePackageConfiguration as unknown as PackageConfiguration

export default configuration
