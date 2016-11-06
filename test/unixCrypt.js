// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import crypt from '../unixCrypt'
// endregion
QUnit.module('unixCrypt')
QUnit.load()
// region tests
QUnit.test('crypt', (assert:Object):void => {
    for (const test:Array<string> of [
        ['foo', 'ba', 'ba4TuD1iozTxw'],
        ['random long string', 'hi', 'hib8W/d4WOlU.'],
        ['foob', 'ar', 'arlEKn0OzVJn.'],
        ['Hello World! This is Unix crypt(3)!', 'ux', 'uxNS5oJDUz4Sc']
    ])
        assert.strictEqual(crypt(...test.slice(0, 2)), test[2])
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
