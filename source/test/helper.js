// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import Helper from '../helper'
import configuration from '../configurator'
// endregion
QUnit.module('helper')
QUnit.load()
// region tests
QUnit.test('generateValidateDocumentUpdateFunctionCode', (
    assert:Object
):void => {
    // region forbidden write tests
    for (const test:Array<any> of [
        // region model
        [{}, {}, {}, {}, {}, 'Type:'],
        [{}, {webNodeType: 'test'}, null, {}, {}, 'Model:'],
        // endregion
        // region property existens
        [
            {types: {Test: {}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'Property:'
        ],
        [
            {types: {Test: {a: {nullable: false}}}},
            {webNodeType: 'Test', a: null},
            null, {}, {}, 'NotNull:'
        ],
         // endregion
        // region property readlonly
        [
            {types: {Test: {a: {writable: false}}}},
            {webNodeType: 'Test', a: 'b'},
            {}, {}, {}, 'Readonly:'
        ],
        [
            {types: {Test: {a: {writable: false}}}},
            {webNodeType: 'Test', a: 'b'},
            {a: 'a'}, {}, {}, 'Readonly:'
        ],
        // endregion
        // region property type
        [
            {types: {Test: {a: {type: 'string'}}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'PropertyType:'
        ],
        [
            {types: {Test: {a: {type: 'number'}}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'PropertyType:'
        ],
        [
            {types: {Test: {a: {type: 'boolean'}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'PropertyType:'
        ],
        [
            {types: {Test: {a: {type: 'DateTime'}}}},
            {webNodeType: 'Test', a: 'a'},
            null, {}, {}, 'PropertyType:'
        ],
        [
            {types: {Test: {a: {type: 'Test'}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'PropertyType:'
        ],
        [
            {types: {Test: {a: {type: 2}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'PropertyType:'
        ],
        // endregion
        // region property range
        [
            {types: {Test: {a: {type: 'number', minimum: 3}}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'Minimum:'
        ],
        [
            {types: {Test: {a: {type: 'number', maximum: 1}}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'Maximum:'
        ],
        [
            {types: {Test: {a: {type: 'string', minimum: 3}}}},
            {webNodeType: 'Test', a: '12'},
            null, {}, {}, 'MinimalLength:'
        ],
        [
            {types: {Test: {a: {type: 'string', maximum: 1}}}},
            {webNodeType: 'Test', a: '12'},
            null, {}, {}, 'MaximalLength:'
        ],
        // endregion
        // region property pattern
        [
            {types: {Test: {a: {
                type: 'string',
                regularExpressionPattern: 'a'
            }}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'PatternMatch:'
        ],
        // endregion
        // region property constraint
        [
            {types: {Test: {a: {
                type: 'string',
                constraint: 'false'
            }}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'Constraint:'
        ],
        [
            {types: {Test: {a: {
                type: 'string',
                constraint: 'newDocument[key] === "a"'
            }}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'Constraint:'
        ]
        // endregion
    ]) {
        const modelSpecification:PlainObject = Tools.extendObject(
            true, {}, configuration.model, test[0])
        const functionCode:string =
            Helper.generateValidateDocumentUpdateFunctionCode(
                modelSpecification)
        assert.strictEqual(typeof functionCode, 'string')
        const validatorGenerator:Function = new Function(
            'toJSON', `return ${functionCode}`)
        assert.strictEqual(typeof validatorGenerator, 'function')
        const validator:Function = validatorGenerator(JSON.stringify)
        assert.strictEqual(typeof validator, 'function')
        assert.throws(():void => validator.apply(this, test.slice(
            1, test.length - 1
        )), (error:Error):boolean => {
            const result:boolean = error.hasOwnProperty(
                'forbidden'
            ) && error.forbidden.startsWith(test[test.length - 1])
            if (!result)
                console.log(
                    `Error "${error.forbidden}" doesn't start with "` +
                    `${test[test.length - 1]}".`)
            return result
        })
    }
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
