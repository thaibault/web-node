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
/* eslint-disable no-duplicate-imports */
import type {PlainObject} from 'clientnode'
/* eslint-enable no-duplicate-imports */
import fileSystem from 'fs'
import handlebars from 'handlebars'
import {createServer, Server} from 'http'
import fetch from 'node-fetch'
import path from 'path'
import PouchDB from 'pouchdb'
import type {ModelConfiguration, Models} from './type'
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
    const {plugins, configuration} = Helper.loadPlugins(
        Tools.copyLimitedRecursively(baseConfiguration))
    await Helper.callPluginStack(
        'preInitialize', plugins, baseConfiguration, configuration)
    if (plugins.length)
        console.info(
            'Loaded plugins: "' + plugins.map((plugin:Object):string =>
                plugin.name
            ).join('", "') + '".')
    for (const type:string of ['pre', 'post'])
        await Helper.callPluginStack(
            `${type}ConfigurationLoaded`, plugins, baseConfiguration,
            configuration, configuration,
            plugins.filter(plugin:Plugin):boolean =>
                Boolean(plugin.configurionFilePath))
    // endregion
    // region start database server
    const databaseServerProcess:ChildProcess = spawnChildProcess(
        'pouchdb-server', [
            '--port', `${configuration.database.port}`,
            '--dir', configuration.database.path,
            '--config', configuration.database.configFilePath
        ], {
            cwd: process.cwd(),
            env: process.env,
            shell: true,
            stdio: 'inherit'
        })
    for (const closeEventName:string of Helper.closeEventNames)
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
        /*
            NOTE: As a needed side effect: This clears preexisting document
            references in "securitySettings[
                configuration.modelConfiguration.specialPropertyNames
                    .validatedDocumentsCache]".
        */
        await fetch(Tools.stringFormat(
            configuration.database.url,
            `${configuration.database.user.name}:` +
            `${configuration.database.user.password}@`
        ) + `/${configuration.name}/_security`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(configuration.database.security)
        })
    } catch (error) {
        console.error(
            `Security object couldn't be applied.: ` +
            Helper.representObject(error))
    }
    // endregion
    const modelConfiguration:ModelConfiguration = Tools.copyLimitedRecursively(
        configuration.modelConfiguration)
    delete modelConfiguration.defaultPropertySpecification
    delete modelConfiguration.models
    const models:Models = Helper.extendModels(configuration.modelConfiguration)
    try {
        // region generate/update authentication/validation code
        let validationCode = Helper.validateDocumentUpdate.toString()
        validationCode = 'function(\n' +
            '    newDocument, oldDocument, userContext, securitySettings\n' +
            ')\n {\n' +
            `const models = ${JSON.stringify(models)}\n` +
            `const modelConfiguration = ` +
            `${JSON.stringify(modelConfiguration)}\n` +
            validationCode.substring(
                validationCode.indexOf('{') + 1,
                validationCode.lastIndexOf('}')
            ).trim().replace(/^ {12}/gm, '') +
            '\n}'
        if (configuration.debug)
            console.info(
                'Specification \n\n"' +
                Helper.representObject(configuration.modelConfiguration) +
                `" has generated validation code: \n\n"${validationCode}".`)
        await Helper.ensureValidationDocumentPresence(
            databaseConnection, 'validation', validationCode,
            'Model specification')
        let authenticationCode = Helper.authenticate.toString()
        authenticationCode = 'function(\n' +
            '    newDocument, oldDocument, userContext, securitySettings\n' +
            ')\n {\n' +
            'const allowedModelRolesMapping = ' +
            JSON.stringify(Helper.determineAllowedModelRolesMapping(
                configuration.modelConfiguration
            )) + '\n' +
            `const typePropertyName = '` +
            `${configuration.modelConfiguration.specialPropertyNames.type}'` +
            `\n` + authenticationCode.substring(
                authenticationCode.indexOf('{') + 1,
                authenticationCode.lastIndexOf('}')
            ).trim().replace(/^ {12}/gm, '') +
            '\n}'
        if (configuration.debug)
            console.info(
                `Authentication code "${authenticationCode}" generated.`)
        await Helper.ensureValidationDocumentPresence(
            databaseConnection, 'authentication', authenticationCode,
            'Authentication logic')
        // endregion
        // region ensure all constraints to have a consistent initial state
        // TODO run migrations scripts if there exists some.
        for (const document:PlainObject of (await databaseConnection.allDocs({
            /* eslint-disable camelcase */
            include_docs: true
            /* eslint-enable camelcase */
        })).rows)
            if (!(typeof document.id === 'string' && document.id.startsWith(
                '_design/'
            ))) {
                let newDocument:?PlainObject = null
                const migrationModelConfiguration:ModelConfiguration =
                    Tools.copyLimitedRecursively(modelConfiguration)
                // NOTE: Will remove not specified properties.
                migrationModelConfiguration.updateStrategy = 'migrate'
                try {
                    newDocument = Helper.validateDocumentUpdate(
                        document, null, {}, Tools.copyLimitedRecursively(
                            configuration.database.security
                        ), models, migrationModelConfiguration)
                } catch (error) {
                    throw new Error(
                        `Document "${Helper.representObject(document)}" ` +
                        `doesn't satisfy its schema: ` +
                        Helper.representObject(error))
                }
                /*
                    NOTE: If a property is missing and a default one could be
                    applied we have an auto migration for that case.
                */
                if (newDocument !== document)
                    databaseConnection.put(newDocument)
            }
        // TODO check conflicting constraints and mark if necessary (check how
        // couchdb deals with "id" conflicts)
        // endregion
        // region start services
        const services:{[key:string]:Object} = await Helper.callPluginStack(
            'postInitialize', plugins, baseConfiguration, configuration, {},
            databaseConnection, databaseServerProcess)
        for (const serviceName:string in services)
            if (services.hasOwnProperty(serviceName))
                console.info(`Service ${serviceName} loaded.`)
        // endregion
    } catch (error) {
        if (configuration.debug)
            throw error
        else
            console.error(error)
    }
    let finished:boolean = false
    const closeHandler = function():void {
        if (!finished)
            databaseConnection.close()
        finished = true
    }
    for (const closeEventName:string of Helper.closeEventNames)
        process.on(closeEventName, closeHandler)
})()
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
