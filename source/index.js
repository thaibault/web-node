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
import fetch from 'node-fetch'
import Tools from 'clientnode'
import PouchDB from 'pouchdb'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import configuration from './configurator'
import Helper from './helper'
// endregion
(async ():Promise<any> => {
    // region ensure presence of admin user
    const unauthenticatedUserDatabaseConnection:PouchDB = new PouchDB(
        `${Tools.stringFormat(configuration.database.url, '')}/_users`)
    try {
        await unauthenticatedUserDatabaseConnection.allDocs()
        console.log(
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
                throw new Error(
                    `Can't login as existing admin user "` +
                    `${configuration.database.user.name}": "` +
                    `${Helper.representObject(error)}".`)
            } finally {
                authenticatedUserDatabaseConnection.close()
            }
        } else
            throw new Error(
                `Can't create new admin user "` +
                `${configuration.database.user.name}": "` +
                `${Helper.representObject(error)}".`)
    } finally {
        unauthenticatedUserDatabaseConnection.close()
    }
    // endregion
    const databaseConnection:PouchDB = new PouchDB(Tools.stringFormat(
        configuration.database.url,
        `${configuration.database.user.name}:` +
        `${configuration.database.user.password}@`
    ) + `/${configuration.name}`)
    try {
        // region generate/update authentication/validation code
        const validationCode:string =
            Helper.generateValidateDocumentUpdateFunctionCode(
                configuration.model)
        if (configuration.debug)
            console.log(
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
            `${configuration.model.typePropertyName}'\n` +
            authenticationCode.substring(
                authenticationCode.indexOf('{') + 1,
                authenticationCode.lastIndexOf('}')
            ).trim().replace(/^ {12}/gm, '')
        if (configuration.debug)
            console.log(
                `Authentication code "${authenticationCode}" generated.`)
        await Helper.ensureValidationDocumentPresence(
            databaseConnection, 'authentication', authenticationCode,
            'Authentication logic')
        // endregion
    } catch (error) {
        if (configuration.debug)
            throw error
        else
            console.log(error)
    } finally {
        databaseConnection.close()
    }
})()
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
