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
    for (const test:Array<any> of [
        [{}, {}, {}, {}, {}, 'Type:'],
        [{}, {webNodeType: 'test'}, {}, {}, {}, 'TypeName:'],
        [{types: {Test: {}}}, {webNodeType: 'Test'}, {}, {}, {}, 'TypeName:']
    ]) {
        const modelSpecification:PlainObject = Tools.extendObject(
            true, configuration.model, test[0])
        const functionCode:string =
            Helper.generateValidateDocumentUpdateFunctionCode(
                modelSpecification)
        console.log('A', functionCode)
        assert.strictEqual(typeof functionCode, 'string')
        const validatorGenerator:Function = new Function(
            `return ${functionCode}`)
        assert.strictEqual(typeof validatorGenerator, 'function')
        const validator:Function = validatorGenerator()
        assert.strictEqual(typeof validator, 'function')
        assert.throws(():void => validator.apply(this, test.slice(
            1, test.length - 1
        )), (error:Error):boolean => {
            const result:boolean = error.forbidden.startsWith(
                test[test.length - 1])
            if (!result)
                console.log(
                    `Error "${error.forbidden} doesn't start with "` +
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
