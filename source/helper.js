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
    // TODO
    static async ensureValidationDocumentPresence(
        database:Object, documentName:string, validationCode:string,
        description:string
    ):void {
        try {
            const document:Object = await database.get(
                `_design/${documentName}`)
            await database.put({
                _id: `_design/${documentName}`,
                _rev: document._rev,
                language: 'javascript',
                /* eslint-disable camelcase */
                validate_doc_update: validationCode
                /* eslint-enable camelcase */
            })
            console.log(`${description} updated.`)
        } catch (error) {
            if (error.error === 'not_found')
                console.log(`${description} not available: create new one.`)
            else
                console.log(
                    `${description} couldn't be updated: "` +
                    `${Helper.representObject(rejection)}" create new one.`)
            try {
                await database.put({
                    _id: `_design/${documentName}`,
                    language: 'javascript',
                    /* eslint-disable camelcase */
                    validate_doc_update: validationCode
                    /* eslint-enable camelcase */
                })
                console.log(`${description} installed/updated.`)
            } catch (error) {
                throw new Error(
                    `${description} couldn't be installed/updated: "` +
                    `${Helper.representObject(error)}".`)
            }
        }
    }
    // TODO
    static authenticate(
        newDocument:Object, oldDocument:?Object, userContext:?Object,
        securitySettings:?Object
    ):void {
        if (!(userContext && userContext.roles.includes('_admin')))
            throw({forbidden: "Only users with role " + role + " or an admin can modify this database."})
    }
    /**
     * Represents given object as formatted string.
     * @param object - Object to Represents.
     * @returns Representation string.
     */
    static representObject(object:any):string {
        return JSON.stringify(object, null, '    ')
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
            "        if (!newDocument.hasOwnProperty('webNodeType'))\n" +
            `            throw {forbidden: 'Type: You have to specify a model type via property "webNodeType".'}\n`
        for (const modelName:string in models)
            if (models.hasOwnProperty(modelName)) {
                code += `        if (newDocument.webNodeType === '${modelName}') {\n`
                // region run hooks and check for needed data
                for (const propertyName:string in models[modelName])
                    if (models[modelName].hasOwnProperty(propertyName)) {
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
                    if (models[modelName].hasOwnProperty(propertyName)) {
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
        code += `        throw {forbidden: 'Model: Given model "' + newDocument.webNodeType + '" is not specified.'}\n` +
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
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
