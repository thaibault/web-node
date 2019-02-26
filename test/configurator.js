// @flow
// -*- coding: utf-8 -*-
'use strict'
import registerTest from 'clientnode/test'

registerTest(async function():Promise<void> {
    this.module('configurator')
    this.test('main', (assert:Object):void => assert.strictEqual(
        typeof require('../configurator').default.debug, 'boolean'))
}, 'plain')
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
