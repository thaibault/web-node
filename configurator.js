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
import type {PlainObject} from 'clientnode'
import fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import type {Configuration} from './type'
import PluginAPI from './pluginAPI'
import packageConfiguration from './package'
/*
    To assume to go two folder up from this file until there is no
    "node_modules" parent folder is usually resilient again dealing with
    projects where current working directory isn't the projects directory and
    this library is located as a nested dependency.
*/
packageConfiguration.webNode.context = {path: __dirname}
while (true) {
    packageConfiguration.webNode.context.path = path.resolve(
        packageConfiguration.webNode.context.path, '../../')
    if (path.basename(path.dirname(
        packageConfiguration.webNode.context.path
    )) !== 'node_modules')
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
        if (fileSystem.lstatSync(path.join(process.cwd(
        ), 'node_modules')).isSymbolicLink())
            packageConfiguration.webNode.context.path = process.cwd()
    } catch (error) {}
let specificConfiguration:PlainObject = {}
try {
    /* eslint-disable no-eval */
    specificConfiguration = eval('require')(path.join(
        packageConfiguration.webNode.context.path, 'package'))
    /* eslint-enable no-eval */
} catch (error) {
    packageConfiguration.webNode.context.path = process.cwd()
}
const name:string = specificConfiguration.hasOwnProperty(
    'documentationWebsite'
) && specificConfiguration.documentationWebsite.name ||
specificConfiguration.name
specificConfiguration = specificConfiguration.webNode || {}
if (name)
    specificConfiguration.name = name
// endregion
packageConfiguration.webNode.name =
    packageConfiguration.documentationWebsite.name
const parameterDescription:Array<string> = [
    'currentPath', 'fileSystem', 'path', 'pluginAPI', 'require', 'tools',
    'webNodePath']
let parameter:Array<any> = [
    /* eslint-disable no-eval */
    process.cwd(), fileSystem, path, PluginAPI, eval('require'), Tools,
    /* eslint-enable no-eval */
    __dirname]
let configuration:Configuration = Tools.resolveDynamicDataStructure(
    packageConfiguration.webNode, parameterDescription, parameter)
delete packageConfiguration.webNode
Tools.extendObject(true, Tools.modifyObject(
    configuration, specificConfiguration
), specificConfiguration)
if (process.argv.length > 3) {
    const result:?Object = Tools.stringParseEncodedObject(
        process.argv[process.argv.length - 1], configuration, 'configuration')
    if (Tools.isPlainObject(result))
        Tools.extendObject(
            true, Tools.modifyObject(configuration, result), result)
}
/*
    NOTE: We need to copy the configuration to avoid operating on deduplicated
    objects in further resolving algorithms which can lead to unexpected
    errors.
*/
configuration = Tools.resolveDynamicDataStructure(Tools.copyLimitedRecursively(
    configuration
), parameterDescription, parameter)
console.log(
    configuration.modelConfiguration.models.User.firstName
    ===
    configuration.modelConfiguration.models.User.lastName
)
configuration.package = packageConfiguration
export default configuration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
