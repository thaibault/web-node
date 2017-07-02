// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import registerTest from 'clientnode/test'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import crypt from '../unixCrypt'
// endregion
registerTest(async function():Promise<void> {
    this.module('unixCrypt')
    // region tests
    this.test('crypt', (assert:Object):void => {
        for (const test:Array<string> of [
            ['', 'ba', 'baJyGvzMWSid.'],
            ['ba', '', 'aayPdtR3JLIkk'],
            ['', '', 'aaQSqAReePlq6'],
            ['foo', 'ba', 'ba4TuD1iozTxw'],
            ['random long string', 'hi', 'hib8W/d4WOlU.'],
            ['foob', 'ar', 'arlEKn0OzVJn.'],
            ['Hello World! This is Unix crypt(3)!', 'ux', 'uxNS5oJDUz4Sc']
        ])
            assert.strictEqual(crypt(...test.slice(0, 2)), test[2])
    })
    // endregion
}, ['plain'])
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
