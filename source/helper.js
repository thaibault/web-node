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
import {ChildProcess, spawn as spawnChildProcess} from 'child_process'
import Tools from 'clientnode'
import fileSystem from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import WebOptimizerHelper from 'weboptimizer/helper'
import type {PlainObject} from 'weboptimizer/type'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
export default class Helper {
    /**
     * Authenticates given document update against given mapping of allowed
     * roles for writing into corresponding model instances.
     * @param newDocument - Updated document.
     * @param oldDocument - If an existing document should be updated its given
     * here.
     * @param userContext - Contains meta information about currently acting
     * user.
     * @param securitySettings - Database security settings.
     * @param allowedModelRolesMapping - Allowed roles for given models.
     * @param typePropertyName - Property name indicating to which model a
     * document belongs to.
     */
    static authenticate(
        newDocument:Object, oldDocument:?Object, userContext:?Object,
        securitySettings:?Object,
        allowedModelRolesMapping:{[key:string]:Array<string>},
        typePropertyName:string
    ):?true {
        let allowedRoles:Array<string> = ['_admin']
        if (userContext) {
            if (
                allowedModelRolesMapping && typePropertyName &&
                newDocument.hasOwnProperty(typePropertyName) &&
                allowedModelRolesMapping.hasOwnProperty(
                    newDocument[typePropertyName])
            )
                allowedRoles = allowedRoles.concat(
                    allowedModelRolesMapping[newDocument[typePropertyName]])
            for (const userRole:string of userContext.roles)
                if (allowedRoles.includes(userRole))
                    return true
        }
        /* eslint-disable no-throw-literal */
        throw {unauthorized:
            'Only users with a least on of these roles are allowed to ' +
            `perform requested action: "${allowedRoles.join('", "')}".`}
        /* eslint-enable no-throw-literal */
    }
    /**
     * Calls all plugin methods for given trigger description.
     * @param type - Type of trigger.
     * @param plugins - List of plugins to search for trigger callbacks in.
     * @param parameter - List of parameter to forward to found callbacks.
     * @returns A promise which resolves when all callbacks have resolved their
     * promise.
     */
    static async callPluginStack(
        type:string, plugins:Array<Object>, ...parameter:Array<any>
    ):Promise<any> {
        let data:any = null
        for (const plugin:Object of plugins)
            data = await plugin.api.apply(Helper, [type, data].concat(
                parameter))
        return data
    }
    /**
     * Checks if given url response with given status code.
     * @param url - Url to check reachability.
     * @param wait - Boolean indicating if we should retry until a status code
     * will be given.
     * @param expectedStatusCode - Status code to check for.
     * @param pollIntervallInSeconds - Seconds between two tries to reach given
     * url.
     * @returns A promise which will be resolved if a request to given url has
     * finished and resulting status code matches given expectedstatus code.
     * Otherwise returned promise will be rejected.
     *
     */
    static async checkReachability(
        url:string, wait:boolean = false, expectedStatusCode:number = 200,
        pollIntervallInSeconds:number = 0.1
    ):Promise<?Object> {
        const check:Function = (response:?Object):?Object => {
            if (
                response && 'status' in response &&
                response.status !== expectedStatusCode
            )
                throw new Error(
                    `Given status code ${response.status} differs from ` +
                    `${expectedStatusCode}.`)
            return response
        }
        if (wait)
            return new Promise((resolve:Function, reject:Function):void => {
                const wrapper:Function = async ():Promise<?Object> => {
                    let response:Object
                    try {
                        response = await fetch(url)
                    } catch (error) {
                        setTimeout(wrapper, pollIntervallInSeconds * 1000)
                        return response
                    }
                    try {
                        resolve(check(response))
                    } catch (error) {
                        reject(error)
                    }
                    return response
                }
                setTimeout(wrapper, 0)
            })
        return check(await fetch(url))
    }
    /**
     * Determines a mapping of all models to roles who are allowed to edit
     * corresponding model instances.
     * @param modelSpecification - Model specification object.
     * @returns The mapping object.
     */
    static determineAllowedModelRolesMapping(
        modelSpecification:PlainObject
    ):{[key:string]:Array<string>} {
        const allowedModelRolesMapping:{[key:string]:Array<string>} = {}
        const models:{[key:string]:PlainObject} = Helper.extendSpecification(
            modelSpecification)
        for (const modelName:string in models)
            if (models.hasOwnProperty(
                modelName
            ) && models[modelName].hasOwnProperty(
                modelSpecification.specialPropertyNames.allowedRoles
            ))
                allowedModelRolesMapping[modelName] = models[modelName][
                    modelSpecification.specialPropertyNames.allowedRoles]
        return allowedModelRolesMapping
    }
    /**
     * Updates/creates a design document in database with a validation function
     * set to given code.
     * @param databaseConnection - Database connection to use for document
     * updates.
     * @param documentName - Design document name.
     * @param validationCode - Code of validation function.
     * @param description - Used to produce semantic logging messages.
     */
    static async ensureValidationDocumentPresence(
        databaseConnection:Object, documentName:string, validationCode:string,
        description:string
    ):Promise<void> {
        try {
            const document:Object = await databaseConnection.get(
                `_design/${documentName}`)
            await databaseConnection.put({
                _id: `_design/${documentName}`,
                _rev: document._rev,
                language: 'javascript',
                /* eslint-disable camelcase */
                validate_doc_update: validationCode
                /* eslint-enable camelcase */
            })
            console.info(`${description} updated.`)
        } catch (error) {
            if (error.error === 'not_found')
                console.info(`${description} not available: create new one.`)
            else
                console.info(
                    `${description} couldn't be updated: "` +
                    `${Helper.representObject(error)}" create new one.`)
            try {
                await databaseConnection.put({
                    _id: `_design/${documentName}`,
                    language: 'javascript',
                    /* eslint-disable camelcase */
                    validate_doc_update: validationCode
                    /* eslint-enable camelcase */
                })
                console.info(`${description} installed/updated.`)
            } catch (error) {
                throw new Error(
                    `${description} couldn't be installed/updated: "` +
                    `${Helper.representObject(error)}".`)
            }
        }
    }
    /**
     * Extend given model with all specified one.
     * @param modelName - Name of model to extend.
     * @param models - Pool of models to extend from.
     * @param extendPropertyName - Property name which indicates model
     * inheritance.
     * @returns Given model in extended version.
     */
    static extendModel(
        modelName:string, models:{[key:string]:PlainObject},
        extendPropertyName:string = 'webNodeExtends'
    ):PlainObject {
        if (modelName === '_base')
            return models[modelName]
        if (models.hasOwnProperty('_base'))
            if (models[modelName].hasOwnProperty(extendPropertyName))
                models[modelName][extendPropertyName] = ['_base'].concat(
                    models[modelName][extendPropertyName])
            else
                models[modelName][extendPropertyName] = '_base'
        if (models[modelName].hasOwnProperty(extendPropertyName)) {
            for (const modelNameToExtend:string of [].concat(models[
                modelName
            ][extendPropertyName]))
                models[modelName] = Tools.extendObject(
                    true, models[modelName], Helper.extendModel(
                        modelNameToExtend, models, extendPropertyName))
            delete models[modelName][extendPropertyName]
        }
        return models[modelName]
    }
    /**
     * Extend default specification with specific one.
     * @param modelSpecification - Model specification object.
     * @returns Models with extended specific specifications.
     */
    static extendSpecification(
        modelSpecification:PlainObject
    ):{[key:string]:PlainObject} {
        modelSpecification = Tools.extendObject(true, {specialPropertyNames: {
            defaultPropertySpecification: {},
            typeNameRegularExpressionPattern: '^[A-Z][a-z0-9]+$'
        }}, modelSpecification)
        const models:{[key:string]:PlainObject} = {}
        for (const modelName:string in Tools.copyLimitedRecursively(
            modelSpecification.types
        ))
            if (modelSpecification.types.hasOwnProperty(
                modelName
            ) && !modelName.startsWith('_')) {
                if (!modelName.match(new RegExp(
                    modelSpecification.specialPropertyNames
                        .typeNameRegularExpressionPattern
                )))
                    throw new Error(
                        'Model names have to match "' +
                        modelSpecification.specialPropertyNames
                            .typeNameRegularExpressionPattern +
                        `" (given name: "${modelName}").`)
                models[modelName] = Helper.extendModel(
                    modelName, modelSpecification.types,
                    modelSpecification.specialPropertyNames.extend)
            }
        for (const modelName:string in models)
            if (models.hasOwnProperty(modelName))
                for (const propertyName:string in models[modelName])
                    if (models[modelName].hasOwnProperty(propertyName))
                        models[modelName][propertyName] = Tools.extendObject(
                            true, {},
                            modelSpecification.defaultPropertySpecification,
                            models[modelName][propertyName])
        return models
    }
    /**
     * Represents a design document validation function for given model
     * specification.
     * @param newDocument - Updated document.
     * @param oldDocument - If an existing document should be updated its given
     * here.
     * @param userContext - Contains meta information about currently acting
     * user.
     * @param securitySettings - Database security settings.
     * @param modelSpecification - Model specification object.
     * @returns Modified given new document.
     */
    static validateDocumentUpdate(
        newDocument:Object, oldDocument:?Object, userContext:?Object = {},
        securitySettings:?Object = {}, models:PlainObject, options:PlainObject,
        toJSON:?Function
    ):Object {
        // TODO clear securitySettings on startup.
        // TODO replace evals by new Functions
        // region ensure needed environment
        if (newDocument.hasOwnProperty('_deleted') && newDocument._deleted)
            return newDocument
        if (securitySettings.hasOwnProperty(
            'validatedDocuments'
        ) && securitySettings.validatedDocuments.has(
            `${newDocument._id}-${newDocument._rev}`
        )) {
            securitySettings.validatedDocuments.delete(
                `${newDocument._id}-${newDocument._rev}`)
            return newDocument
        }
        if (newDocument.hasOwnProperty(
            '_rev'
        ) && newDocument._rev === 'latest')
            if (oldDocument && oldDocument.hasOwnProperty('_rev'))
                newDocument._rev = oldDocument._rev
            else
                throw {
                    forbidden: 'Revision: No old document to update available.'
                }
        if (!options)
            options = {}
        if (!toJSON)
            if (JSON && JSON.hasOwnProperty('stringify'))
                toJSON:Function = (object:Object):string => JSON.stringify(
                    object, null, '    ')
            else
                throw new Error('Needed "toJSON" function is not available.')
        const reservedPropertyNames:Array<string> =
            options.reservedPropertyNames || []
        const updateStrategy:string = options.updateStrategy || 'fillUp'
        const allowedRolesPropertyName:string =
                options.specialPropertyNames.allowedRoles ||
                'webNodeAllowedRoles'
        // endregion
        const checkDocument:Function = (
            newDocument:Object, oldDocument:?Object
        ):Object => {
            // region check for model type
            if (!newDocument.hasOwnProperty(options.specialPropertyNames.type))
                throw {
                    forbidden: 'Type: You have to specify a model type via ' +
                        `property "${options.specialPropertyNames.type}".`
                }
            if (!models.hasOwnProperty(
                newDocument[options.specialPropertyNames.type]
            ))
                throw {
                    forbidden: 'Model: Given model "' +
                        newDocument[options.specialPropertyNames.type] +
                        '" is not specified.'
                }
            // endregion
            const modelName:string = newDocument[
                options.specialPropertyNames.type]
            const modelSpecification:PlainObject = models[modelName]
            const checkPropertyContent:Function = (
                newValue:any, name:string, specification:Object, oldValue:?any
            ):any {
                // region type
                if (['DateTime'].includes(specification.type)) {
                    if (typeof newValue !== 'number')
                        throw {
                            forbidden: `PropertyType: Property "${name}" ` +
                                `isn't of type "DateTime" (given "` +
                                `${newValue}").`
                        }
                } else if (modelSpecification.hasOwnProperty(
                    specification.type
                ))
                    if (typeof newValue === 'object' && Object.getPrototypeOf(
                        newValue
                    ) === Object.prototype) {
                        newValue = checkDocument(newValue, oldValue)
                        if (toJSON(newValue) === toJSON({}))
                            return null
                    } else
                        throw {
                            forbidden: 'NestedModel: Under key "${name}" ' +
                                `isn't "${specification.type}" (given "` +
                                `${newValue}").`
                        }
                else if (['string', 'number', 'boolean'].includes(
                    specification.type
                )) {
                    if (typeof newValue !== specification.type)
                        throw {
                            forbidden: `PropertyType: Property "${name}" ` +
                                `isn't of type "${specification.type}" ` +
                                `(given "${newValue}").`
                        }
                } else if (newValue !== specification.type)
                    throw {
                        forbidden: `PropertyType: Property "${name}" isn't ` +
                            `value "${specification.type}" (given "` +
                            `${newValue}").`
                    }
                // endregion
                // region range
                if (![undefined, null].includes(specification.minimum))
                    if (specification.type === 'string')
                        if (newValue.length < specification.minimum)
                            throw {
                                forbidden: `MinimalLength: Property "${name}` +
                                '" (type string) should have minimal length ' +
                                `${specification.minimum}.`
                            }
                    else if ([
                        'number', 'integer', 'float', 'DateTime'
                    ].includes(specification.type) &&
                    newValue < specification.minimum)
                        throw {
                            forbidden: `Minimum: Property "${name}" (type ` +
                                `${specification.type}) should satisfy a ` +
                                `minimum of ${specification.minimum}.`
                        }
                if (![undefined, null].includes(specification.maximum))
                    if (specification.type === 'string')
                        if (newValue.length > specification.maximum)
                            throw {
                                forbidden: `MaximalLength: Property "${name}` +
                                    ' (type string) should have maximal ' +
                                    `length ${specification.maximum}.`
                            }
                    else if ([
                        'number', 'integer', 'float', 'DateTime'
                    ].includes(
                        specification.type
                    ) && newValue > specification.maximum)
                        throw {
                            forbidden: `Maximum: Property "${name}" (type ` +
                                `${specification.type}) should satisfy a ` +
                                `maximum of ${specification.maximum}.`
                        }
                // endregion
                // region pattern
                if (!([undefined, null].includes(
                    specification.regularExpressionPattern
                ) || (new RegExp(specification.regularExpressionPattern)).test(
                    newValue
                )))
                    throw {
                        forbidden: `PatternMatch: Property "${name}" should ` +
                            'match regular expression pattern ' +
                            `${specification.regularExpressionPattern} ` +
                            `(given "${newValue}").`
                    }
                // endregion
                // region generic constraint
                for (const type:string of [
                    'constraintEvaluation', 'constraintExpression'
                ])
                    if (!([undefined, null].includes(
                        specification[type]
                    ) || (new Function(
                        'newDocument', 'oldDocument', 'userContext',
                        'securitySettings', 'models', 'options', 'modelName',
                        'modelSpecification', 'checkDocument',
                        'checkPropertyContent', 'newValue', 'name',
                        'specification', 'oldValue', (type.endsWith(
                            'Evaluation'
                        ) ? 'return ' : '') + specification[type]
                    )(
                        newDocument, oldDocument, userContext,
                        securitySettings, models, options, modelName,
                        modelSpecification, checkDocument,
                        checkPropertyContent, newValue, name, specification,
                        oldValue
                    ))))
                        throw {
                            forbidden: type.charAt(0).toUpperCase(
                            ) + type.substring(1) + ` Property "${name}" ` +
                            `should satisfy constraint "` +
                            `${specification[type]}" (given "` +
                            `${newDocumentAssignment}").`
                        }
                // endregion
                return newValue
            }
            // region run hooks and check for presence of needed data
            for (const propertyName:string in modelSpecification)
                if (
                    propertyName !== allowedRolesPropertyName
                    && modelSpecification.hasOwnProperty(propertyName)
                ) {
                    const specification:PlainObject = modelSpecification[
                        propertyName]
                    if (!oldDocument)
                        for (const type:string of [
                            'onCreateEvaluation', 'onCreateExpression'
                        ])
                            if (specification[type])
                                newDocument[propertyName] = (new Function(
                                    'newDocument', 'oldDocument',
                                    'userContext', 'securitySettings', 'name',
                                    'models', 'options', 'modelName',
                                    'modelSpecification', 'checkDocument',
                                    'checkPropertyContent', 'specification',
                                    (type.endsWith(
                                        'Evaluation'
                                    ) ? 'return ' : '') + specification[type]
                                )(
                                    newDocument, oldDocument, userContext,
                                    securitySettings, propertyName, models,
                                    options, modelName, modelSpecification,
                                    checkDocument, checkPropertyContent,
                                    specification
                                ))
                    for (const type:string of [
                        'onUpdateEvaluation', 'onUpdateExpression'
                    ])
                        if (specification[type])
                            newDocument[propertyName] = (new Function(
                                'newDocument', 'oldDocument', 'userContext',
                                'securitySettings', 'name', 'models',
                                'options', 'modelName', 'modelSpecification',
                                'checkDocument', 'checkPropertyContent',
                                'specification', (type.endsWith(
                                    'Evaluation'
                                ) ? 'return ' : '') + specification[type]
                            )(
                                newDocument, oldDocument, userContext,
                                securitySettings, propertyName, models,
                                options, modelName, modelSpecification,
                                checkDocument, checkPropertyContent,
                                specification
                            ))
                    if ([undefined, null].includes(specification.default)) {
                        if (!(specification.nullable || (
                            newDocument.hasOwnProperty(propertyName) ||
                            oldDocument && oldDocument.hasOwnProperty(
                                propertyName)
                        )))
                            throw {
                                forbidden: 'MissingProperty: Missing ' +
                                    `property "${propertyName}".`
                            }
                        if (!newDocument.hasOwnProperty(
                            propertyName
                        ) && oldDocument && oldDocument.hasOwnProperty(
                            propertyName
                        ) && updateStrategy === 'fillUp')
                            newDocument[propertyName] = oldDocument[
                                propertyName]
                    } else if (!newDocument.hasOwnProperty(propertyName))
                        if (updateStrategy === 'fillUp')
                            if (oldDocument)
                                newDocument[propertyName] = oldDocument[
                                    propertyName]
                            else
                                newDocument[propertyName] =
                                    specification.default
                        else if (!oldDocument)
                            newDocument[propertyName] = specification.default
                }
            // endregion
            // region check given data
            if (oldDocument && updateStrategy === 'incremental')
                for (const key:string in newDocument)
                    if (
                        newDocument.hasOwnProperty(key) && key !== '_id' &&
                        oldDocument.hasOwnProperty(
                            key
                        ) && oldDocument[key] === newDocument[key] &&
                        !reservedPropertyNames.includes(key)
                    ) {
                        delete newDocument[key]
                        continue
                    }
            for (const propertyName:string in newDocument)
                if (newDocument.hasOwnProperty(propertyName)) {
                    if (!modelSpecification.hasOwnProperty(propertyName))
                        throw {
                            forbidden: 'Property: Given property "' +
                                `${propertyName}" isn't specified in model "` +
                                `${modelName}".`
                        }
                    const specification:PlainObject = modelSpecification[
                        modelName
                    ][propertyName]
                    // region writable/mutable
                    if (!specification.writable)
                        if (oldDocument)
                            if (oldDocument.hasOwnProperty(
                                propertyName
                            ) && toJSON(newDocument[propertyName]) === toJSON(
                                oldDocument[propertyName]
                            )) {
                                if (
                                    propertyName !== '_id' &&
                                    updateStrategy === 'incremental'
                                )
                                    delete newDocument[propertyName]
                                continue
                            } else
                                throw {
                                    forbidden: 'Readonly: Property "' +
                                        `${propertyName}" is not writable ` +
                                        `(old document "` +
                                        `${toJSON(oldDocument)}").`
                                }
                        else
                            throw {
                                forbidden: 'Readonly: Property "' +
                                    `${propertyName}" is not writable.`
                            }
                    if (!specification.mutable && oldDocument)
                        if (oldDocument.hasOwnProperty(propertyName) && toJSON(
                            newDocument[propertyName]
                        ) === toJSON(oldDocument[propertyName])) {
                            if (
                                propertyName !== '_id' &&
                                updateStrategy === 'incremental'
                            )
                                delete newDocument[propertyName]
                            continue
                        } else
                            throw {
                                forbidden: 'Readonly: Property "' +
                                    `${propertyName}" is not writable (old ` +
                                    `document "${toJSON(oldDocument)}").`
                            }
                    // endregion
                    // region nullable
                    if (newDocument[propertyName] === null)
                        if (specification.nullable) {
                            delete newDocument[propertyName]
                            continue
                        } else
                            throw {
                                forbidden: 'NotNull: Property "' +
                                    `${propertyName}" should not by "null".`
                            }
                    // endregion
                    if (
                        typeof specification.type === 'string' &&
                        specification.type.endsWith('[]')
                    ) {
                        specification.type = specification.type.substring(
                            0, specification.type.length - '[]'.length)
                        if (!Array.isArray(newDocument[name]))
                            throw {
                                forbidden: 'PropertyType: Property "' +
                                    `${propertyName}" isn't of type "array ` +
                                    `-> ${specification.type}" (given "` +
                                    `${newDocument[propertyName]}").`
                            }
                        const specification.type =
                            specification.type.substring(
                                0, specification.type.length - '[]'.length)
                        let index:number = 0
                        for (const value:any of newDocument[
                            propertyName
                        ].slice()) {
                            newDocument[propertyName][index] =
                                checkPropertyContent(
                                    value,
                                    `${index + 1}. value in ${propertyName}`,
                                    specification)
                            if (newDocument[propertyName][index] === null)
                                newDocument[propertyName].splice(index, 1)
                            index += 1
                        }
                    } else {
                        newDocument[propertyName] = checkPropertyContent(
                            newDocument[propertyName], propertyName,
                            specification,
                            oldDocument && oldDocument.hasOwnProperty(
                                propertyName
                            ) && oldDocument[propertyName] || undefined)
                        if (newDocument[propertyName] === null)
                            delete newDocument[propertyName]
                    }
                }
            // endregion
            return newDocument
        }
        newDocument = checkDocument(newDocument, oldDocument)
        if (securitySettings.hasOwnProperty('checkedDocuments'))
            securitySettings.validatedDocuments.add(
                `${newDocument._id}-${newDocument._rev}`)
        else
            securitySettings.validatedDocuments = new Set([
                `${newDocument._id}-${newDocument._rev}`])
        return newDocument
    }
    /**
     * Extends given configuration object with given plugin specific ones and
     * returns a plugin specific meta information object.
     * @param name - Name of plugin to extend.
     * @param plugins - List of all yet determined plugin informations.
     * @param configuration - Plugin specific configurations.
     * @param optionsPropertyNames - Property names to search for to use as
     * entry in plugin configuration file.
     * @param pluginPath - Path to given plugin.
     * @return An object of plugin specific meta informations.
     */
    static loadPlugin(
        name:string, plugins:{[key:string]:Object},
        configuration:PlainObject, optionsPropertyNames:Array<string>,
        pluginPath:string
    ):Object {
        for (const name:string of optionsPropertyNames)
            if (configuration.hasOwnProperty(name)) {
                let indexFilePath:string = 'index.js'
                if (configuration.hasOwnProperty('main'))
                    indexFilePath = configuration.main
                indexFilePath = path.resolve(pluginPath, indexFilePath)
                if (!WebOptimizerHelper.isFileSync(indexFilePath))
                    fileSystem.readdirSync(pluginPath).forEach((
                        fileName:string
                    ):void => {
                        if (
                            fileName !== 'package.json' &&
                            WebOptimizerHelper.isFileSync(path.resolve(
                                pluginPath, fileName))
                        )
                            if (!(WebOptimizerHelper.isFileSync(
                                indexFilePath
                            ) && ['index', 'main'].includes(path.basename(
                                indexFilePath, path.extname(fileName)
                            ))))
                                indexFilePath = path.resolve(
                                    pluginPath, indexFilePath)
                    })
                if (!WebOptimizerHelper.isFileSync(indexFilePath))
                    throw new Error(
                        `Can't find an entry file in "${pluginPath}" for ` +
                        `plugin "${name}".`)
                let api:Function
                if (indexFilePath.endsWith('.js'))
                    api = async (type:string, ...parameter:Array<any>):any => {
                        const currentTimestamp:number = fileSystem.statSync(
                            pluginPath
                        ).mtime.getTime()
                        if (plugins[
                            name
                        ].lastLoadTimestamp < currentTimestamp) {
                            // Enforce to reload new module version.
                            /* eslint-disable no-eval */
                            delete eval('require').cache[eval(
                                'require'
                            ).resolve(indexFilePath)]
                            /* eslint-enable no-eval */
                            try {
                                /* eslint-disable no-eval */
                                plugins[name].scope = eval('require')(
                                    indexFilePath)
                                /* eslint-enable no-eval */
                            } catch (error) {
                                throw new Error(
                                    `Couln't load plugin file "` +
                                    `${indexFilePath}" for plugin "${name}":` +
                                    ` ${Helper.representObject(error)}.`)
                            }
                        }
                        plugins[name].lastLoadTimestamp = currentTimestamp
                        if (type in plugins[name].scope)
                            return await plugins[name].scope[type].apply(
                                plugins[name].scope, parameter)
                    }
                else
                    api = ():Promise<any> => new Promise((
                        resolve:Function, reject:Function
                    ):void => {
                        const childProcess:ChildProcess =
                            spawnChildProcess(
                                indexFilePath, Tools.arrayMake(arguments),
                                {
                                    cwd: process.cwd(),
                                    env: process.env,
                                    shell: true,
                                    stdio: 'inherit'
                                })
                        for (const closeEventName:string of [
                            'exit', 'close', 'uncaughtException', 'SIGINT',
                            'SIGTERM', 'SIGQUIT'
                        ])
                            childProcess.on(
                                closeEventName,
                                WebOptimizerHelper.getProcessCloseHandler(
                                    resolve, reject, closeEventName))
                    })
                let scope:Object
                try {
                    /* eslint-disable no-eval */
                    scope = eval('require')(indexFilePath)
                    /* eslint-enable no-eval */
                } catch (error) {
                    throw new Error(
                        `Couln't load plugin file "${indexFilePath}" for ` +
                        `plugin "${name}": ` +
                        Helper.representObject(error))
                }
                return {
                    api,
                    configuration: configuration[name],
                    indexFilePath,
                    name,
                    path: pluginPath,
                    lastLoadTimestamp: fileSystem.statSync(
                        pluginPath
                    ).mtime.getTime(),
                    scope
                }
            }
        throw new Error(
            `Plugin "${name}" hasn't working configuration object under one ` +
            `of the following keys: "${optionsPropertyNames.join(", ")}".`)
    }
    /**
     * Extends given configuration object with all plugin specific ones and
     * returns a topological sorted list of plugins with plugins specific
     * meta informations stored.
     * @param configuration - Configuration object to extend and use.
     * @returns A topological sorted list of plugins objects.
     */
    static loadPlugins(configuration:PlainObject):{
        configuration:PlainObject;
        plugins:Array<Object>
    } {
        const plugins:{[key:string]:Object} = {}
        for (const type:string in configuration.plugin.directories)
            if (configuration.plugin.directories.hasOwnProperty(
                type
            ) && WebOptimizerHelper.isDirectorySync(
                configuration.plugin.directories[type].path
            ))
                fileSystem.readdirSync(
                    configuration.plugin.directories[type].path
                ).forEach((pluginName:string):void => {
                    if (!(new RegExp(configuration.plugin.directories[
                        type
                    ].nameRegularExpressionPattern)).test(pluginName))
                        return
                    const currentPluginPath:string = path.resolve(
                        configuration.plugin.directories[type].path, pluginName
                    )
                    if (WebOptimizerHelper.isDirectorySync(
                        currentPluginPath
                    ) && WebOptimizerHelper.isFileSync(
                        `${currentPluginPath}/package.json`
                    )) {
                        let pluginConfiguration:Object
                        try {
                            pluginConfiguration = JSON.parse(
                                fileSystem.readFileSync(currentPluginPath, {
                                    encoding: configuration.encoding}))
                        } catch (error) {
                            console.warn(
                                'Failed to load options for plugin ' +
                                `"${pluginName}": ` +
                                Helper.representObject(error))
                            return
                        }
                        plugins[pluginName] = Helper.loadPlugin(
                            pluginName, plugins, pluginConfiguration,
                            configuration.plugin.optionsPropertyNames,
                            currentPluginPath)
                    }
                })
        const sortedPlugins:Array<Object> = []
        const temporaryPlugins:{[key:string]:Array<string>} = {}
        for (const pluginName:string in plugins)
            if (plugins.hasOwnProperty(pluginName))
                if (plugins[pluginName].hasOwnProperty('dependencies'))
                    temporaryPlugins[pluginName] = plugins[
                        pluginName
                    ].dependencies
                else
                    temporaryPlugins[pluginName] = []
        for (const pluginName:string of Tools.arraySortTopological(
            temporaryPlugins
        ))
            sortedPlugins.push(plugins[pluginName])
        for (const plugin:Object of sortedPlugins)
            configuration = Tools.extendObject(true, Tools.modifyObject(
                configuration, plugin.configuration
            ), plugin.configuration)
        const parameterDescription:Array<string> = [
            'self', 'webOptimizerPath', 'currentPath', 'path', 'helper',
            'tools', 'plugins']
        const parameter:Array<any> = [
            configuration, __dirname, process.cwd(), path, Helper, Tools,
            sortedPlugins]
        configuration = Tools.unwrapProxy(Tools.resolveDynamicDataStructure(
            configuration, parameterDescription, parameter))
        return {plugins: sortedPlugins, configuration}
    }
    /**
     * Represents given object as formatted string.
     * @param object - Object to Represents.
     * @returns Representation string.
     */
    static representObject(object:any):string {
        return JSON.stringify(object, null, '    ')
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
