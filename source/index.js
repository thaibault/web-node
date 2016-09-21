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
import {
    ChildProcess, exec as execChildProcess, spawn as spawnChildProcess
} from 'child_process'
import Tools from 'clientnode'
import * as fileSystem from 'fs'
import path from 'path'
import PouchDB from 'pouchdb'
import {sync as removeDirectoryRecursivelySync} from 'rimraf'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import Helper from './helper'
import packageConfiguration from '../package'
import type {Configuration} from './type'
// endregion
// region load configuration
const parameterDescription:Array<string> = [
    'self', 'webOptimizerPath', 'currentPath', 'path', 'helper', 'tools']
const parameter:Array<any> = [
    packageConfiguration.webNode, __dirname, process.cwd(), path, Helper, Tools
]
const configuration:Configuration = Tools.resolveDynamicDataStructure(
    packageConfiguration.webNode, parameterDescription, parameter)
// endregion
// region generate/update validation code
const validationCode:string =
    Helper.generateValidateDocumentUpdateFunctionCode(configuration.model)
if (configuration.debug)
    console.log(
        'Specification \n\n"' +
        `${JSON.stringify(configuration.model, null, '    ')}" has ` +
        `generated validation code: \n\n"${validationCode}".`)
const database:PouchDB = new PouchDB(
    `http://127.0.0.1:5984/${packageConfiguration.name}`)
database.get('_design/validation').then((document) =>
    database.put({
        _id: '_design/validation',
        _rev: document._rev,
        language: 'javascript',
        validate_doc_update: validationCode
    })
).then((response) =>
    console.log(`Model specification updated: "${JSON.stringify(response, null, '    ')}".`)
).catch((rejection) => {
    console.log(
        `Model specification couldn't be updated: "${JSON.stringify(rejection, null, '    ')}" ``creation ` +
        `new one.`)
    database.put({
        _id: '_design/validation',
        language: 'javascript',
        validate_doc_update: validationCode
    }).then((response) =>
        console.log(`Model specification installed: "${JSON.stringify(response, null, '    ')}".`)
    ).catch((rejection) => {
        throw Error(
            `Model specification couldn't be installed: "${JSON.stringify(rejection, null, '    ')}".`)
    })
})
// endregion
process.exit()
database.put({
    _id: 'fun',
    jau: 'yolo'
}).then((response) =>
    console.log(JSON.stringify(response, null, '    '))
).catch((rejection) => {
    throw Error(JSON.stringify(rejection, null, '    '))
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
