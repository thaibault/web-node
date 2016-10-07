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
    let userDatabase:PouchDB = new PouchDB(
        `${Tools.stringFormat(configuration.database.url, '')}/_users`)
    try {
        await userDatabase.allDocs()
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
            userDatabase = new PouchDB(Tools.stringFormat(
                configuration.database.url,
                `${configuration.database.user.name}:` +
                `${configuration.database.user.password}@`
            ) + '/_users')
            try {
                await userDatabase.allDocs()
            } catch (error) {
                throw new Error(
                    `Can't login as existing admin user "` +
                    `${configuration.database.user.name}": "` +
                    `${Helper.representObject(error)}".`)
            } finally {
                userDatabase.close()
            }
        } else
            throw new Error(
                `Can't create new admin user "` +
                `${configuration.database.user.name}": "` +
                `${Helper.representObject(error)}".`)
    } finally {
        userDatabase.close()
    }
    // endregion
    const database:PouchDB = new PouchDB(Tools.stringFormat(
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
            database, 'validation', validationCode, 'Model specification')
        let authenticationCode = Helper.authenticate.toString()
        authenticationCode = authenticationCode.substring(
            authenticationCode.indexOf('{') + 1,
            authenticationCode.lastIndexOf('}')
        ).trim()
        if (configuration.debug)
            console.log(
                `Authentication code "${authenticationCode}" generated.`)
        await Helper.ensureValidationDocumentPresence(
            database, 'authentication', authenticationCode,
            'Authentication logic')
        // endregion
    } catch (error) {
        if (configuration.debug)
            throw error
        else
            console.log(error)
    } finally {
        database.close()
    }
})()
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
