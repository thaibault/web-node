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
     * Generates a design document validation function for given model
     * specification.
     * @param modelSpecification - Model specification object.
     * @returns Value generated code.
     */
    static generateValidateDocumentUpdateFunctionCode(
        modelSpecification:PlainObject
    ):string {
        // region  extend default specification with specific
        modelSpecification = Tools.extendObject(true, {
            typeNameRegularExpressionPattern: '^[a-zA-Z0-9]+$'
        }, modelSpecification)
        const models:{[key:string]:PlainObject} = {}
        for (const modelName:string in modelSpecification.types)
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
                models[modelName] = Tools.copyLimitedRecursively(
                    modelSpecification.types[modelName])
                // TODO must be done recursively to support nested extends.
                if (models[modelName].hasOwnProperty('_extend'))
                    models[modelName]._extend = ['_base'].concat(
                        models[modelName]._extend)
                else
                    models[modelName]._extend = ['_base']
                for (const modelNameToExtend:string of models[
                    modelName
                ]._extend)
                    models[modelName] = Tools.extendObject(
                        true, models[modelName], modelSpecification.types[
                            modelNameToExtend])
                delete models[modelName]._extend
            }
        // endregion
        let code:string = 'function validator(newDocument, oldDocument, userContext, securitySettings) {\n' +
            '    function checkDocument(newDocument, oldDocument) {\n' +
            "        if (!newDocument.hasOwnProperty('webNodeType'))\n" +
            `            throw {forbidden: 'Type: You have to specify a model type via property "webNodeType".'}\n`
        for (const modelName:string in models)
            if (models.hasOwnProperty(modelName)) {
                code += `        if (newDocument.webNodeType === '${modelName}') {\n` +
                        '            for (var key in newDocument)\n' +
                        `                if (newDocument.hasOwnProperty(key) && !['_id', '_rev'].includes(key)) {\n`
                for (const propertyName:string in models[modelName])
                    if (models[modelName].hasOwnProperty(propertyName)) {
                        const specification:PlainObject = models[modelName][
                            propertyName
                        ] = Tools.extendObject(
                            true, {},
                            modelSpecification.defaultPropertySpecification,
                            models[modelName][propertyName])
                        code += `                    if (key === '${propertyName}') {\n`
                        // region runtime trigger
                        if (specification.onCreate)
                            code += '                        if (!oldDocument)\n' +
                                    `                            newDocument[key] = ${specification.onCreate}\n`
                        if (specification.onUpdate)
                            code += `                        newDocument[key] = ${specification.onUpdate}\n`
                        if (!specification.writable)
                            code += '                        if (oldDocument && toJSON(\n' +
                                    '                            oldDocument[key]\n' +
                                    '                        ) !== toJSON(newDocument[key]))\n' +
                                    `                            throw {forbidden: 'Readonly: Property "${propertyName}" is not writable (old document "' + toJSON(oldDocument) + '").'}\n`
                        // endregion
                        // region nullable
                        code += `                        if (newDocument[key] === null) {\n`
                        if (specification.nullable || specification.default)
                            code += '                            delete newDocument[key]\n' +
                                '                            continue\n' +
                                '                        }\n'
                        else
                            code += `                            throw {forbidden: 'NotNull: Property "${propertyName}" should not by "null".'}\n` +
                                    '                        }\n'
                        // endregion
                        // region type
                        if (['string', 'number', 'boolean'].includes(specification.type))
                            code += `                        if (typeof newDocument[key] !== '${specification.type}')\n`
                        else if (['DateTime'].includes(specification.type))
                            code += `                        if (typeof newDocument[key] !== 'number')\n`
                        else if (models.hasOwnProperty(specification.type))
                            code += "                        if (typeof newDocument[key] === 'object' && newDocument[key] !== null && Object.getPrototypeOf(newDocument[key]) === Object.prototype)\n" +
                                    '                            checkDocument(newDocument[key], oldDocument[key], user)\n' +
                                    '                        else\n' +
                                    `                            throw {forbidden: 'NestedModel: Under key "' + key + '" isn\\'t "${propertyName}" (given "' + newDocument[key] + '").'}\n`
                        else
                            code += `                        if (newDocument[key] !== ${specification.type})\n`
                        code += `                            throw {forbidden: 'PropertyType: Property "${propertyName}" isn\\'t value "${specification.type}" (given "' + newDocument[key] + '").'}\n`
                        // endregion
                        // region range
                        if (![undefined, null].includes(specification.minimum))
                            if ('string' === models[modelName][propertyName].type)
                                code += `                        if (${specification.minimum} > newDocument[key].length)\n` +
                                        `                            throw {forbidden: 'MinimalLength: Property "${propertyName}" (type string) should have minimal length ${specification.minimum}.'}\n`
                            else if (['number', 'integer', 'float', 'DateTime'].includes(models[modelName][propertyName].type))
                                code += `                        if (${specification.minimum} > newDocument[key])\n` +
                                        `                            throw {forbidden: 'Minimum: Property "${propertyName}" (type ${specification.type}) should satisfy a minimum of ${specification.minimum}.'}\n`
                        if (![undefined, null].includes(specification.maximum))
                            if ('string' === models[modelName][propertyName].type)
                                code += `                        if (${specification.maximum} < newDocument[key].length)\n` +
                                        `                            throw {forbidden: 'MaximalLength: Property "${propertyName}" (type string) should have maximal length ${specification.maximum}.'}\n`
                            else if (['number', 'integer', 'float', 'DateTime'].includes(models[modelName][propertyName].type))
                                code += `                        if (${specification.maximum} < newDocument[key])\n` +
                                        `                            throw {forbidden: 'Maximum: Property "${propertyName}" (type ${specification.type}) should satisfy a maximum of ${specification.maximum}.'}\n`
                        // endregion
                        // region pattern
                        if (![undefined, null].includes(specification.regularExpressionPattern))
                            code += `                        if (!/${specification.regularExpressionPattern}/.test(newDocument[key]))\n` +
                                    `                            throw {forbidden: 'PatternMatch: Property "${propertyName}" should match regular expression pattern ${specification.regularExpressionPattern} (given "' + newDocument[key] + '").'}\n`
                        // endregion
                        // region generic constraint
                        if (![undefined, null].includes(specification.constraint))
                            code += `                        if (!(${specification.constraint}))` +
                                    `                            throw {forbidden: 'Constraint: Property "${propertyName}" should satisfy constraint "${specification.constraint}" (given "' + newDocument[key] + '").'}\n`
                        // endregion
                        code += '                        continue\n' +
                                '                    }\n'
                    }
                    code += `                    throw {forbidden: 'Property: Given property "' + key + '" isn\\'t specified in model "${modelName}".'}\n`
                code += '                }\n' +
                        '            return\n' +
                        '        }\n'
                // region default value
                for (const propertyName:string in models[modelName])
                    if (models[modelName].hasOwnProperty(propertyName) && ![undefined, null].includes(models[modelName][propertyName].default))
                        code += `        if (!newDocument.hasOwnProperty('${propertyName}') || [null, undefined].includes(newDocument.${propertyName}))\n` +
                                `            newDocument.${propertyName} = ${models[modelName][propertyName].default}\n`
                // endregion
            }
        code += `        throw {forbidden: 'Model: Given model "' + newDocument.webNodeType + '" is not specified.'}\n` +
        '    }\n' +
        '    checkDocument.apply(this, arguments)\n' +
        '}'
        return code
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
