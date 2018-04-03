// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import registerTest from 'clientnode/test'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
// endregion
registerTest(async function():Promise<void> {
    this.module('configurator')
    // region tests
    this.test('main', (assert:Object):void => assert.strictEqual(
        typeof require('../configurator').default.debug, 'boolean'))
    // endregion
}, 'plain')
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
