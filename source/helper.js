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
import fileSystem from 'fs'
import path from 'path'
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
        for (const plugin:Object of plugins)
            await plugin[type].apply(Helper, parameter)
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
                modelSpecification.allowedRolesPropertyName
            ))
                allowedModelRolesMapping[modelName] = models[modelName][
                    modelSpecification.allowedRolesPropertyName]
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
     * @returns Given model in extended version.
     */
    static extendModel(
        modelName:string, models:{[key:string]:PlainObject}
    ):PlainObject {
        if (modelName === '_base')
            return models[modelName]
        if (models.hasOwnProperty('_base'))
            if (models[modelName].hasOwnProperty('_extend'))
                models[modelName]._extend = ['_base'].concat(
                    models[modelName]._extend)
            else
                models[modelName]._extend = '_base'
        if (models[modelName].hasOwnProperty('_extend')) {
            for (const modelNameToExtend:string of [].concat(models[
                modelName
            ]._extend))
                models[modelName] = Tools.extendObject(
                    true, models[modelName], Helper.extendModel(
                        modelNameToExtend, models))
            delete models[modelName]._extend
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
        modelSpecification = Tools.extendObject(true, {
            typeNameRegularExpressionPattern: '^[A-Z][a-z0-9]+$'
        }, modelSpecification)
        const models:{[key:string]:PlainObject} = {}
        for (const modelName:string in Tools.copyLimitedRecursively(
            modelSpecification.types
        ))
            if (modelSpecification.types.hasOwnProperty(
                modelName
            ) && !modelName.startsWith('_')) {
                if (!modelName.match(new RegExp(
                    modelSpecification.typeNameRegularExpressionPattern
                )))
                    throw new Error(
                        'Model names have to match "' +
                        modelSpecification.typeNameRegularExpressionPattern +
                        `" (given name: "${modelName}").`)
                models[modelName] = Helper.extendModel(
                    modelName, modelSpecification.types)
            }
        return models
    }
    /**
     * Generates a design document validation function for given model
     * specification.
     * @param modelSpecification - Model specification object.
     * @returns Value generated code.
     */
    static generateValidateDocumentUpdateFunctionCode(
        modelSpecification:PlainObject
    ):string {
        const models:{[key:string]:PlainObject} = Helper.extendSpecification(
            modelSpecification)
        /* eslint-disable max-len */
        let code:string = 'function(newDocument, oldDocument, userContext, securitySettings) {\n' +
            "    'use strict';\n" +
            '    if (!userContext)\n' +
            '        userContext = {}\n' +
            '    if (!securitySettings)\n' +
            '        securitySettings = {}\n' +
            "    if (newDocument.hasOwnProperty('_deleted') && newDocument._deleted)\n" +
            '        return newDocument\n' +
            "    if (securitySettings.hasOwnProperty('validatedDocuments') && securitySettings.validatedDocuments.has(`${newDocument._id}-${newDocument._rev}`)) {\n" +
            '        securitySettings.validatedDocuments.delete(`${newDocument._id}-${newDocument._rev}`)\n' +
            '        return newDocument\n' +
            '    }\n' +
            "    if (newDocument.hasOwnProperty('_rev') && newDocument._rev === 'latest')\n" +
            "        if (oldDocument && oldDocument.hasOwnProperty('_rev'))\n" +
            '            newDocument._rev = oldDocument._rev\n' +
            '        else\n' +
            "            throw {forbidden: 'Revision: No old document to update available.'}\n" +
            '    const checkDocument = (newDocument, oldDocument) => {\n' +
            `        if (!newDocument.hasOwnProperty('${modelSpecification.typePropertyName}'))\n` +
            `            throw {forbidden: 'Type: You have to specify a model type via property "${modelSpecification.typePropertyName}".'}\n`
        for (const modelName:string in models)
            if (models.hasOwnProperty(modelName)) {
                code += `        if (newDocument.${modelSpecification.typePropertyName} === '${modelName}') {\n`
                // region run hooks and check for needed data
                for (const propertyName:string in models[modelName])
                    if (propertyName !== modelSpecification.allowedRolesPropertyName && models[modelName].hasOwnProperty(propertyName)) {
                        let newDocumentAssignment:string = `newDocument.${propertyName}`
                        let oldDocumentAssignment:string = `oldDocument.${propertyName}`
                        if (propertyName === 'class') {
                            newDocumentAssignment = `newDocument['${propertyName}']`
                            oldDocumentAssignment = `oldDocument['${propertyName}']`
                        }
                        const specification:PlainObject = models[modelName][
                            propertyName
                        ] = Tools.extendObject(
                            true, {},
                            modelSpecification.defaultPropertySpecification,
                            models[modelName][propertyName])
                        if (specification.onCreate)
                            code += '            if (!oldDocument)\n' +
                                    `                ${newDocumentAssignment} = ${specification.onCreate}\n`
                        if (specification.onUpdate)
                            code += `            ${newDocumentAssignment} = ${specification.onUpdate}\n`
                        if ([undefined, null].includes(specification.default)) {
                            if (!specification.nullable)
                                code += `            if (!(newDocument.hasOwnProperty('${propertyName}') || oldDocument && oldDocument.hasOwnProperty('${propertyName}')))\n` +
                                        `                throw {forbidden: 'MissingProperty: Missing property "${propertyName}".'}\n`
                            if (modelSpecification.updateStrategy === 'fillUp')
                                code += `            if (!newDocument.hasOwnProperty('${propertyName}') && oldDocument && oldDocument.hasOwnProperty('${propertyName}'))\n` +
                                        `                ${newDocumentAssignment} = ${oldDocumentAssignment}\n`
                        } else {
                            code += `            if (!newDocument.hasOwnProperty('${propertyName}'))\n`
                            if (modelSpecification.updateStrategy === 'fillUp')
                                code += '                if (oldDocument)\n' +
                                        `                    ${newDocumentAssignment} = ${oldDocumentAssignment}\n` +
                                        '                else\n'
                            else
                                code += '                if (!oldDocument)\n'
                            code += `                    ${newDocumentAssignment} = ${specification.default}\n`
                        }
                    }
                // endregion
                // region generate check given data code
                code += '            for (const key in newDocument)\n' +
                        `                if (!['_rev', '_revisions', '_deleted'].includes(key) && newDocument.hasOwnProperty(key)) {\n`
                if (modelSpecification.updateStrategy === 'incremental')
                    code += "                    if (key !== '_id' && oldDocument && oldDocument.hasOwnProperty(key) && oldDocument[key] === newDocument[key]) {\n" +
                            '                        delete newDocument[key]\n' +
                            '                        continue\n' +
                            '                    }\n'
                for (const propertyName:string in models[modelName])
                    if (propertyName !== modelSpecification.allowedRolesPropertyName && models[modelName].hasOwnProperty(propertyName)) {
                        let newDocumentAssignment:string = `newDocument.${propertyName}`
                        let oldDocumentAssignment:string = `oldDocument.${propertyName}`
                        if (propertyName === 'class') {
                            newDocumentAssignment = `newDocument['${propertyName}']`
                            oldDocumentAssignment = `oldDocument['${propertyName}']`
                        }
                        const parentNewDocumentAssignment:string =
                            newDocumentAssignment
                        const specification:PlainObject = models[modelName][
                            propertyName]
                        code += `                    if (key === '${propertyName}') {\n`
                        // region writable
                        if (!specification.writable) {
                            code += '                        if (oldDocument) {\n' +
                                    `                            if (!(oldDocument.hasOwnProperty('${propertyName}') && toJSON(${newDocumentAssignment}) === toJSON(${oldDocumentAssignment})))\n` +
                                    `                                throw {forbidden: 'Readonly: Property "${propertyName}" is not mutable (old document "' + toJSON(oldDocument) + '").'}\n`
                            if (propertyName !== '_id' && modelSpecification.updateStrategy === 'incremental')
                                code += `                            delete ${newDocumentAssignment}\n`
                            code += '                            continue\n' +
                                    '                        }\n'
                        }
                        // endregion
                        // region nullable
                        if (typeof specification.type === 'string' && specification.type.endsWith('[]'))
                            code += `                        if (${newDocumentAssignment} === null || Array.isArray(${newDocumentAssignment}) && ${newDocumentAssignment}.length === 0) {\n`
                        else
                            code += `                        if (${newDocumentAssignment} === null) {\n`
                        if (specification.nullable)
                            code += `                            delete ${newDocumentAssignment}\n` +
                                '                            continue\n' +
                                '                        }\n'
                        else
                            code += `                            throw {forbidden: 'NotNull: Property "${propertyName}" should not by "null".'}\n` +
                                    '                        }\n'
                        // endregion
                        // region type
                        let indent:string = ''
                        if (typeof specification.type === 'string' && specification.type.endsWith('[]')) {
                            specification.type = specification.type.substring(0, specification.type.length - '[]'.length)
                            code += `                        if (!Array.isArray(${newDocumentAssignment}))\n` +
                                    `                            throw {forbidden: 'PropertyType: Property "${propertyName}" isn\\'t of type "array" (given "' + ${newDocumentAssignment} + '").'}\n` +
                                    '                        let index = 0\n' +
                                    `                        for (const value of ${newDocumentAssignment}.slice()) {\n`
                            // TODO beschreibung in error meldungen welches feld betroffen ist muss verbessert werden.
                            newDocumentAssignment = 'value'
                            indent = '    '
                        }
                        if (['string', 'number', 'boolean'].includes(specification.type))
                            code += `${indent}                        if (typeof ${newDocumentAssignment} !== '${specification.type}')\n` +
                                    `${indent}                            throw {forbidden: 'PropertyType: Property "${propertyName}" isn\\'t of type "${specification.type}" (given "' + ${newDocumentAssignment} + '").'}\n`
                        else if (['DateTime'].includes(specification.type))
                            code += `${indent}                        if (typeof ${newDocumentAssignment} !== 'number')\n` +
                                    `${indent}                            throw {forbidden: 'PropertyType: Property "${propertyName}" isn\\'t of type "DateTime" (given "' + ${newDocumentAssignment} + '").'}\n`
                        else if (models.hasOwnProperty(specification.type)) {
                            code += `${indent}                        if (typeof ${newDocumentAssignment} === 'object' && Object.getPrototypeOf(${newDocumentAssignment}) === Object.prototype) {\n`
                            if (indent)
                                code += `                                ${parentNewDocumentAssignment}[index] = checkDocument(${newDocumentAssignment})\n` +
                                        `                                if (toJSON(${parentNewDocumentAssignment}[index]) === toJSON({})) {\n` +
                                        `                                    if (${parentNewDocumentAssignment}.length === 1)\n` +
                                        `                                        delete ${parentNewDocumentAssignment}\n` +
                                        '                                    else\n' +
                                        `                                        ${parentNewDocumentAssignment}.splice(index, 1)\n` +
                                        '                                    continue\n' +
                                        '                                }\n' +
                                        '                            }\n'
                            else
                                code += `                            ${newDocumentAssignment} = checkDocument(${newDocumentAssignment}, oldDocument && oldDocument.hasOwnProperty(key) && ${oldDocumentAssignment} || undefined)\n` +
                                        `                            if (toJSON(${newDocumentAssignment}) === toJSON({})) {\n` +
                                        `                                delete ${newDocumentAssignment}\n` +
                                        '                                continue\n' +
                                        '                            }\n' +
                                        '                        } else\n' +
                                        `                            throw {forbidden: 'NestedModel: Under key "${propertyName}" isn\\'t "${specification.type}" (given "' + ${newDocumentAssignment} + '").'}\n`
                        } else
                            code += `${indent}                        if (${newDocumentAssignment} !== ${specification.type})\n` +
                                    `${indent}                            throw {forbidden: 'PropertyType: Property "${propertyName}" isn\\'t value "${specification.type}" (given "' + ${newDocumentAssignment} + '").'}\n`
                        // endregion
                        // region range
                        if (![undefined, null].includes(specification.minimum))
                            if (models[modelName][propertyName].type === 'string')
                                code += `${indent}                        if (${newDocumentAssignment}.length < ${specification.minimum})\n` +
                                        `${indent}                            throw {forbidden: 'MinimalLength: Property "${propertyName}" (type string) should have minimal length ${specification.minimum}.'}\n`
                            else if (['number', 'integer', 'float', 'DateTime'].includes(models[modelName][propertyName].type))
                                code += `${indent}                        if (${newDocumentAssignment} < ${specification.minimum})\n` +
                                        `${indent}                            throw {forbidden: 'Minimum: Property "${propertyName}" (type ${specification.type}) should satisfy a minimum of ${specification.minimum}.'}\n`
                        if (![undefined, null].includes(specification.maximum))
                            if (models[modelName][propertyName].type === 'string')
                                code += `${indent}                        if (${newDocumentAssignment}.length > ${specification.maximum})\n` +
                                        `${indent}                            throw {forbidden: 'MaximalLength: Property "${propertyName}" (type string) should have maximal length ${specification.maximum}.'}\n`
                            else if (['number', 'integer', 'float', 'DateTime'].includes(models[modelName][propertyName].type))
                                code += `${indent}                        if (${newDocumentAssignment} > ${specification.maximum})\n` +
                                        `${indent}                            throw {forbidden: 'Maximum: Property "${propertyName}" (type ${specification.type}) should satisfy a maximum of ${specification.maximum}.'}\n`
                        // endregion
                        // region pattern
                        if (![undefined, null].includes(specification.regularExpressionPattern))
                            code += `${indent}                        if (!(/${specification.regularExpressionPattern}/.test(${newDocumentAssignment})))\n` +
                                    `${indent}                            throw {forbidden: 'PatternMatch: Property "${propertyName}" should match regular expression pattern ${specification.regularExpressionPattern} (given "' + ${newDocumentAssignment} + '").'}\n`
                        // endregion
                        // region generic constraint
                        if (![undefined, null].includes(specification.constraint))
                            code += `${indent}                        if (!(${specification.constraint}))\n` +
                                    `${indent}                            throw {forbidden: 'Constraint: Property "${propertyName}" should satisfy constraint "${specification.constraint}" (given "' + ${newDocumentAssignment} + '").'}\n`
                        // endregion
                        if (indent)
                            code += '                            index += 1\n' +
                                    '                        }\n'
                        code += '                        continue\n' +
                                '                    }\n'
                    }
                code += `                    throw {forbidden: 'Property: Given property "' + key + '" isn\\'t specified in model "${modelName}".'}\n` +
                        '                }\n' +
                        '            return newDocument\n' +
                        '        }\n'
                // endregion
            }
        code += `        throw {forbidden: 'Model: Given model "' + newDocument.${modelSpecification.typePropertyName} + '" is not specified.'}\n` +
        '    }\n' +
        '    newDocument = checkDocument(newDocument, oldDocument)\n' +
        "    if (securitySettings.hasOwnProperty('checkedDocuments'))\n" +
        '        securitySettings.validatedDocuments.add(`${newDocument._id}-${newDocument._rev}`)\n' +
        '    else\n' +
        '        securitySettings.validatedDocuments = new Set([`${newDocument._id}-${newDocument._rev}`])\n' +
        '    return newDocument\n' +
        '}'
        /* eslint-enable max-len */
        return code
    }
    /**
     * Checks if given path points to a valid directory.
     * @param filePath - Path to directory.
     * @returns A boolean which indicates directory existents.
     */
    static isDirectorySync(filePath:string):boolean {
        try {
            return fileSystem.statSync(filePath).isDirectory()
        } catch (error) {
            return false
        }
    }
    /**
     * Checks if given path points to a valid file.
     * @param filePath - Path to file.
     * @returns A boolean which indicates file existents.
     */
    static isFileSync(filePath:string):boolean {
        try {
            return fileSystem.statSync(filePath).isFile()
        } catch (error) {
            return false
        }
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
        for (const pluginPath:string of configuration.plugin.directoryPaths)
            if (Helper.isDirectorySync(pluginPath))
                fileSystem.readdirSync(pluginPath).forEach((
                    pluginName:string
                ):void => {
                    if (!pluginName.match(new RegExp(
                        configuration.plugin.directoryNameRegularExpressionPattern
                    )))
                        return
                    const currentPluginPath:string = path.resolve(
                        pluginPath, pluginName)
                    const stat:Object = fileSystem.statSync(currentPluginPath)
                    if (stat && stat.isDirectory() && Helper.isFileSync(
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
                        for (const name:string of configuration.plugin.optionsPropertyNames)
                            if (configuration.hasOwnProperty(name)) {
                                plugins[pluginName] = {
                                    name: pluginName,
                                    path: currentPluginPath,
                                    configuration: pluginConfiguration[name]
                                }
                                break
                            }
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
