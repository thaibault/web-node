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
import {ChildProcess, spawn as spawnChildProcess} from 'child_process'
import Tools from 'clientnode'
import type {PlainObject} from 'clientnode'
import http from 'http'
import fetch from 'node-fetch'
import PouchDB from 'pouchdb'
import WebOptimizerHelper from 'weboptimizer/helper'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import baseConfiguration from './configurator'
import Helper from './helper'
// endregion
(async ():Promise<any> => {
    // region load plugins
    const {plugins, configuration} = Helper.loadPlugins(baseConfiguration)
    if (plugins.length)
        console.info(
            'Loaded plugins: "' + plugins.map((plugin:Object):string =>
                plugin.name
            ).join('", "') + '".')
    // endregion
    // region start database server
    const databaseServerProcess:ChildProcess = spawnChildProcess(
        'pouchdb-server', [
            '--port', configuration.database.port,
            '--dir', configuration.database.path,
            '--config', configuration.database.configFilePath
        ], {
            cwd: process.cwd(),
            env: process.env,
            shell: true,
            stdio: 'inherit'
        })
    for (const closeEventName:string of [
        'exit', 'close', 'uncaughtException', 'SIGINT', 'SIGTERM',
        'SIGQUIT'
    ])
        databaseServerProcess.on(
            closeEventName, WebOptimizerHelper.getProcessCloseHandler(
                Tools.noop, Tools.noop, closeEventName))
    await Helper.checkReachability(
        Tools.stringFormat(configuration.database.url, ''), true)
    // endregion
    // region ensure presence of global admin user
    const unauthenticatedUserDatabaseConnection:PouchDB = new PouchDB(
        `${Tools.stringFormat(configuration.database.url, '')}/_users`)
    try {
        await unauthenticatedUserDatabaseConnection.allDocs()
        console.info(
            'No admin user available. Automatically creating admin user "' +
            `${configuration.database.user.name}".`)
        await fetch(
            `${Tools.stringFormat(configuration.database.url, '')}/_config/` +
            `admins/${configuration.database.user.name}`,
            {
                method: 'PUT',
                body: `"${configuration.database.user.password}"`
            })
    } catch (error) {
        if (error.hasOwnProperty('name') && error.name === 'unauthorized') {
            const authenticatedUserDatabaseConnection = new PouchDB(
                Tools.stringFormat(
                    configuration.database.url,
                    `${configuration.database.user.name}:` +
                    `${configuration.database.user.password}@`
                ) + '/_users')
            try {
                await authenticatedUserDatabaseConnection.allDocs()
            } catch (error) {
                console.error(
                    `Can't login as existing admin user "` +
                    `${configuration.database.user.name}": "` +
                    `${Helper.representObject(error)}".`)
            } finally {
                authenticatedUserDatabaseConnection.close()
            }
        } else
            console.error(
                `Can't create new admin user "` +
                `${configuration.database.user.name}": "` +
                `${Helper.representObject(error)}".`)
    } finally {
        unauthenticatedUserDatabaseConnection.close()
    }
    // endregion
    // region apply database/rest api configuration
    for (const configurationPath:string in configuration.database)
        if (configuration.database.hasOwnProperty(
            configurationPath
        ) && configurationPath.includes('/'))
            try {
                await fetch(Tools.stringFormat(
                    configuration.database.url,
                    `${configuration.database.user.name}:` +
                    `${configuration.database.user.password}@`
                ) + `/_config/${configurationPath}`, {
                    method: 'PUT',
                    body: `"${configuration.database[configurationPath]}"`
                })
            } catch (error) {
                console.error(
                    `Configuration "${configurationPath}" couldn't be ` +
                    'applied to "' +
                    `${configuration.database[configurationPath]}": ` +
                    Helper.representObject(error))
            }
    // endregion
    const databaseConnection:PouchDB = new PouchDB(Tools.stringFormat(
        configuration.database.url,
        `${configuration.database.user.name}:` +
        `${configuration.database.user.password}@`
    ) + `/${configuration.name}`)
    // region ensure presence of database security settings
    try {
        await fetch(Tools.stringFormat(
            configuration.database.url,
            `${configuration.database.user.name}:` +
            `${configuration.database.user.password}@`
        ) + `/${configuration.name}/_security`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                admins: {
                    names: [],
                    roles: []
                },
                members: {
                    names: [],
                    roles: ['users']
                }
            })
        })
    } catch (error) {
        console.error(
            `Security object couldn't be applied.: ` +
            Helper.representObject(error))
    }
    // endregion
    try {
        // region generate/update authentication/validation code
        let validationCode = Helper.validateDocumentUpdate.toString()
        const modelOptions:PlainObject = Tools.copyLimitedRecursively(
            configuration.model)
        delete options.defaultPropertySpecification
        delete modelOptions.type
        validationCode = 'const models = ' +
            JSON.stringify(Helper.extendSpecification(
                configuration.model
            )) + '\n' +
            `const options = ${modelOptions}\n` +
            validationCode.substring(
                validationCode.indexOf('{') + 1,
                validationCode.lastIndexOf('}')
            ).trim().replace(/^ {12}/gm, '')
        if (configuration.debug)
            console.info(
                'Specification \n\n"' +
                `${JSON.stringify(configuration.model, null, '    ')}" has ` +
                `generated validation code: \n\n"${validationCode}".`)
        await Helper.ensureValidationDocumentPresence(
            databaseConnection, 'validation', validationCode,
            'Model specification')
        let authenticationCode = Helper.authenticate.toString()
        authenticationCode = 'const allowedModelRolesMapping = ' +
            JSON.stringify(Helper.determineAllowedModelRolesMapping(
                configuration.model
            )) + '\n' +
            "const typePropertyName = '" +
            `${configuration.model.specialPropertyNames.type}'\n` +
            authenticationCode.substring(
                authenticationCode.indexOf('{') + 1,
                authenticationCode.lastIndexOf('}')
            ).trim().replace(/^ {12}/gm, '')
        if (configuration.debug)
            console.info(
                `Authentication code "${authenticationCode}" generated.`)
        await Helper.ensureValidationDocumentPresence(
            databaseConnection, 'authentication', authenticationCode,
            'Authentication logic')
        // endregion
        // region start application server
        const server = http.createServer(async (
            request:Object, response:Object
        ):any => {
            await Helper.callPluginStack('request', plugins, request, response)
            response.end()
        }).listen(
            configuration.server.application.port,
            configuration.server.application.hostName)
        await Helper.callPluginStack(
            'initialize', plugins, server, databaseConnection, configuration)
        // endregion
    } catch (error) {
        if (configuration.debug)
            throw error
        else
            console.error(error)
    } finally {
        databaseConnection.close()
    }
})()
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
