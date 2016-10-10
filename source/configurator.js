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
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import Helper from './helper'
import packageConfiguration from '../package'
// endregion
const parameterDescription:Array<string> = [
    'self', 'webOptimizerPath', 'currentPath', 'path', 'helper', 'tools']
const parameter:Array<any> = [
    packageConfiguration.webNode, __dirname, process.cwd(), path, Helper, Tools
]
packageConfiguration.webNode.name =
    packageConfiguration.documentationWebsite.name
export default Tools.unwrapProxy(Tools.resolveDynamicDataStructure(
    packageConfiguration.webNode, parameterDescription, parameter))
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
