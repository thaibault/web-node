// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
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
        [{}, {}, {}, {}, {}],
        [{types: {}}, {a: 2}, {}, {}, {}]
    ]) {
        const functionCode:string =
            Helper.generateValidateDocumentUpdateFunctionCode(test[0])
        assert.strictEqual(typeof functionCode, 'string')
        const validatorGenerator:Function = new Function(
            `return ${functionCode}`)
        assert.strictEqual(typeof validatorGenerator, 'function')
        const validator:Function = validatorGenerator()
        assert.strictEqual(typeof validator, 'function')
        console.log(validator.toString())
        validator.apply(this, test.slice(1))
        // assert.ok(validator.apply(this, test.slice(1)))
    }
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
