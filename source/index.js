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
import PouchDB from 'pouchdb'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import Helper from './helper'
import configuration from './configurator'
// endregion
// region ensure presence of admin user
const userDatabase:PouchDB = new PouchDB(
    `http://admin:${configuration.masterPassword}@127.0.0.1:5984/_config/admins`)
try {
    console.log('A', await userDatabase.get({_id: 'admin'}))
} catch (error) {
    console.log(error)
}
/*
userDatabase.get({_id: 'admin'}).catch((rejection:Object):Promise<Object> =>
    userDatabase.put({_id: 'admin'}).then((response:Object):void =>
        console.log('Created new admin user.')
    ).catch((rejection:Object):void => console.log(
        `Can't create missing admin user: ` + JSON.stringify(
            rejection, null, '    '))))
*/
// endregion
process.exit()
const database:PouchDB = new PouchDB(
    `http://admin:${configuration.masterPassword}@127.0.0.1:5984/` +
    configuration.name)
// region generate/update validation code
// / region enforce model schema
const validationCode:string =
    Helper.generateValidateDocumentUpdateFunctionCode(configuration.model)
if (configuration.debug)
    console.log(
        'Specification \n\n"' +
        `${JSON.stringify(configuration.model, null, '    ')}" has ` +
        `generated validation code: \n\n"${validationCode}".`)
const databaseInitilisation:Promise<Object> = database.get(
    '_design/validation'
).then((document:Object):Promise<Object> => database.put({
    _id: '_design/validation',
    _rev: document._rev,
    language: 'javascript',
    /* eslint-disable camelcase */
    validate_doc_update: validationCode
    /* eslint-enable camelcase */
})).then((response:Object):Object => {
    console.log('Model specification updated.')
    return response
}).catch((rejection:Object):Promise<Object> => {
    if (rejection.error === 'not_found')
        console.log(
            `Model specification not available: creation new one.`)
    else
        console.log(
            `Model specification couldn't be updated: "` +
            `${JSON.stringify(rejection, null, '    ')}" creation new one.`)
    return database.put({
        _id: '_design/validation',
        language: 'javascript',
        /* eslint-disable camelcase */
        validate_doc_update: validationCode
        /* eslint-enable camelcase */
    }).then((response:Object):Object => {
        console.log('Model specification installed.')
        return response
    }).catch((rejection:Object):void => {
        throw new Error(
            `Model specification couldn't be installed: "` +
            `${JSON.stringify(rejection, null, '    ')}".`)
    })
})
// / endregion
// / region enforce authorized data changes
// TODO
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
