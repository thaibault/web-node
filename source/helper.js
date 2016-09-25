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
            typeNameRegularExpressionPattern: '^[a-zA-Z0-9]+$'
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
        let code:string = 'function validator(newDocument, oldDocument, userContext, securitySettings) {\n' +
            "    'use strict';\n" +
            '    function checkDocument(newDocument, oldDocument) {\n' +
            "        if (!newDocument.hasOwnProperty('webNodeType'))\n" +
            `            throw {forbidden: 'Type: You have to specify a model type via property "webNodeType".'}\n`
        for (const modelName:string in models)
            if (models.hasOwnProperty(modelName)) {
                code += `        if (newDocument.webNodeType === '${modelName}') {\n`
                // region run hooks and check for needed data
                for (const propertyName:string in models[modelName])
                    if (models[modelName].hasOwnProperty(propertyName)) {
                        let assignment:string = `.${propertyName}`
                        if (propertyName === 'class')
                            assignment = `['${propertyName}']`
                        const specification:PlainObject = models[modelName][
                            propertyName
                        ] = Tools.extendObject(
                            true, {},
                            modelSpecification.defaultPropertySpecification,
                            models[modelName][propertyName])
                        if (specification.onCreate)
                            code += '            if (!oldDocument)\n' +
                                    `                newDocument${assignment} = ${specification.onCreate}\n`
                        if (specification.onUpdate)
                            code += `            newDocument${assignment} = ${specification.onUpdate}\n`
                        if ([undefined, null].includes(specification.default)) {
                            if (!specification.nullable)
                                code += `            if (!(newDocument.hasOwnProperty('${propertyName}') || oldDocument && oldDocument.hasOwnProperty('${propertyName}')))\n` +
                                        `                throw {forbidden: 'MissingProperty: Missing property "${propertyName}".'}\n`
                        } else
                            code += `            if (!newDocument.hasOwnProperty('${propertyName}') || [null, undefined].includes(newDocument${assignment}))\n` +
                                    `                newDocument${assignment} = ${specification.default}\n`
                    }
                // endregion
                // region generate check given data code
                code += '            for (var key in newDocument)\n' +
                        `                if (newDocument.hasOwnProperty(key) && !['_id', '_rev'].includes(key)) {\n` +
                        `                    if (oldDocument && oldDocument.hasOwnProperty(key) && oldDocument[key] === newDocument[key]) {\n` +
                        '                        delete newDocument[key]\n' +
                        '                        continue\n' +
                        '                    }\n'
                for (const propertyName:string in models[modelName])
                    if (models[modelName].hasOwnProperty(propertyName)) {
                        let assignment:string = `.${propertyName}`
                        if (propertyName === 'class')
                            assignment = `['${propertyName}']`
                        const specification:PlainObject = models[modelName][
                            propertyName]
                        code += `                    if (key === '${propertyName}') {\n`
                        // region writable
                        if (!specification.writable)
                            code += '                        if (oldDocument) {\n' +
                                    `                            if (!(oldDocument.hasOwnProperty('${propertyName}') && toJSON(oldDocument${assignment}) === toJSON(newDocument${assignment})))\n` +
                                    `                                throw {forbidden: 'Readonly: Property "${propertyName}" is not mutable (old document "' + toJSON(oldDocument) + '").'}\n` +
                                    `                            delete newDocument${assignment}\n` +
                                    '                            continue\n' +
                                    '                        }\n'
                        // endregion
                        // region nullable
                        code += `                        if (newDocument${assignment} === null) {\n`
                        if (specification.nullable)
                            code += `                            delete newDocument${assignment}\n` +
                                '                            continue\n' +
                                '                        }\n'
                        else
                            code += `                            throw {forbidden: 'NotNull: Property "${propertyName}" should not by "null".'}\n` +
                                    '                        }\n'
                        // endregion
                        // region type
                        if (['string', 'number', 'boolean'].includes(specification.type))
                            code += `                        if (typeof newDocument${assignment} !== '${specification.type}')\n` +
                                    `                            throw {forbidden: 'PropertyType: Property "${propertyName}" isn\\'t of type "${specification.type}" (given "' + newDocument${assignment} + '").'}\n`
                        else if (['DateTime'].includes(specification.type))
                            code += `                        if (typeof newDocument${assignment} !== 'number')\n` +
                                    `                            throw {forbidden: 'PropertyType: Property "${propertyName}" isn\\'t of type "DateTime" (given "' + newDocument${assignment} + '").'}\n`
                        else if (models.hasOwnProperty(specification.type))
                            code += `                        if (typeof newDocument${assignment} === 'object' && Object.getPrototypeOf(newDocument${assignment}) === Object.prototype) {\n` +
                                    `                            newDocument${assignment} = checkDocument(newDocument${assignment}, oldDocument && oldDocument.hasOwnProperty(key) && oldDocument${assignment} || undefined)\n` +
                                    `                            if (toJSON(newDocument${assignment}) === toJSON({})) {\n` +
                                    `                                delete newDocument${assignment}\n` +
                                    '                                continue\n' +
                                    '                            }\n' +
                                    '                        } else\n' +
                                    `                            throw {forbidden: 'NestedModel: Under key "${propertyName}" isn\\'t "${specification.type}" (given "' + newDocument${assignment} + '").'}\n`
                        else
                            code += `                        if (newDocument${assignment} !== ${specification.type})\n` +
                                    `                            throw {forbidden: 'PropertyType: Property "${propertyName}" isn\\'t value "${specification.type}" (given "' + newDocument${assignment} + '").'}\n`
                        // endregion
                        // region range
                        if (![undefined, null].includes(specification.minimum))
                            if (models[modelName][propertyName].type === 'string')
                                code += `                        if (${specification.minimum} > newDocument${assignment}.length)\n` +
                                        `                            throw {forbidden: 'MinimalLength: Property "${propertyName}" (type string) should have minimal length ${specification.minimum}.'}\n`
                            else if (['number', 'integer', 'float', 'DateTime'].includes(models[modelName][propertyName].type))
                                code += `                        if (${specification.minimum} > newDocument${assignment})\n` +
                                        `                            throw {forbidden: 'Minimum: Property "${propertyName}" (type ${specification.type}) should satisfy a minimum of ${specification.minimum}.'}\n`
                        if (![undefined, null].includes(specification.maximum))
                            if (models[modelName][propertyName].type === 'string')
                                code += `                        if (${specification.maximum} < newDocument${assignment}.length)\n` +
                                        `                            throw {forbidden: 'MaximalLength: Property "${propertyName}" (type string) should have maximal length ${specification.maximum}.'}\n`
                            else if (['number', 'integer', 'float', 'DateTime'].includes(models[modelName][propertyName].type))
                                code += `                        if (${specification.maximum} < newDocument${assignment})\n` +
                                        `                            throw {forbidden: 'Maximum: Property "${propertyName}" (type ${specification.type}) should satisfy a maximum of ${specification.maximum}.'}\n`
                        // endregion
                        // region pattern
                        if (![undefined, null].includes(specification.regularExpressionPattern))
                            code += `                        if (!(/${specification.regularExpressionPattern}/.test(newDocument${assignment})))\n` +
                                    `                            throw {forbidden: 'PatternMatch: Property "${propertyName}" should match regular expression pattern ${specification.regularExpressionPattern} (given "' + newDocument${assignment} + '").'}\n`
                        // endregion
                        // region generic constraint
                        if (![undefined, null].includes(specification.constraint))
                            code += `                        if (!(${specification.constraint}))\n` +
                                    `                            throw {forbidden: 'Constraint: Property "${propertyName}" should satisfy constraint "${specification.constraint}" (given "' + newDocument${assignment} + '").'}\n`
                        // endregion
                        code += '                        continue\n' +
                                '                    }\n'
                    }
                    code += `                    throw {forbidden: 'Property: Given property "' + key + '" isn\\'t specified in model "${modelName}".'}\n`
                code += '                }\n' +
                        '            return newDocument\n' +
                        '        }\n'
                // endregion
            }
        code += `        throw {forbidden: 'Model: Given model "' + newDocument.webNodeType + '" is not specified.'}\n` +
        '    }\n' +
        '    return checkDocument.apply(this, arguments)\n' +
        '}'
        return code
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
