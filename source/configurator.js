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
import Helper from './helper'
import WebOptimizerHelper from 'weboptimizer/helper'
import packageConfiguration from '../package'
/*
    To assume to go two folder up from this file until there is no
    "node_modules" parent folder is usually resilient again dealing with
    projects where current working directory isn't the projects directory and
    this library is located as a nested dependency.
*/
packageConfiguration.context = {
    path: __dirname, type: 'main'
}
while (true) {
    packageConfiguration.context.path = path.resolve(
        packageConfiguration.context.path, '../../')
    if (path.basename(path.dirname(
        packageConfiguration.context.path
    )) !== 'node_modules')
        break
}
if (
    path.basename(path.dirname(process.cwd())) === 'node_modules' ||
    path.basename(path.dirname(process.cwd())) === '.staging' &&
    path.basename(path.dirname(path.dirname(process.cwd()))) === 'node_modules'
) {
    /*
        NOTE: If we are dealing was a dependency project use current directory
        as context.
    */
    packageConfiguration.context.path = process.cwd()
    packageConfiguration.context.type = 'dependency'
} else
    /*
        NOTE: If the current working directory references this file via a
        linked "node_modules" folder using current working directory as context
        is a better assumption than two folders up the hierarchy.
    */
    try {
        if (fileSystem.lstatSync(path.join(process.cwd(
        ), 'node_modules')).isSymbolicLink())
            packageConfiguration.context.path = process.cwd()
    } catch (error) {}
let specificConfiguration:PlainObject = {}
try {
    specificConfiguration = module.require(path.join(
        packageConfiguration.context.path, 'package'))
} catch (error) {
    packageConfiguration.context.path = process.cwd()
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
    'self', 'webOptimizerPath', 'currentPath', 'path', 'helper', 'tools']
const parameter:Array<any> = [
    packageConfiguration.webNode, __dirname, process.cwd(), path, Helper, Tools
]
const configuration = Tools.unwrapProxy(Tools.resolveDynamicDataStructure(
    packageConfiguration.webNode, parameterDescription, parameter))
Tools.extendObject(true, Tools.modifyObject(
    configuration, specificConfiguration
), specificConfiguration)
if (process.argv.length > 3) {
    const result:?Object = WebOptimizerHelper.parseEncodedObject(
        process.argv[process.argv.length - 1], configuration, 'configuration')
    if (Tools.isPlainObject(result))
        Tools.extendObject(
            true, Tools.modifyObject(configuration, result), result)
}
export default Tools.unwrapProxy(Tools.resolveDynamicDataStructure(
    Tools.resolveDynamicDataStructure(
        configuration, parameterDescription, parameter
    ), parameterDescription, parameter, true))
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
