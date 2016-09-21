#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {ChildProcess} from 'child_process'
import {Duplex as DuplexStream} from 'stream'
import * as fileSystem from 'fs'
import path from 'path'
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import type {
    BuildConfiguration, Path, TraverseFilesCallbackFunction
} from '../type'
import Helper from '../helper.compiled'
// endregion
QUnit.module('helper')
QUnit.load()
// region tests
QUnit.test('generateValidateDocumentUpdateFunctionCode', (
    assert:Object
):void => {
    for (const test:Array<any> of [
        [{}]
    ]) {
        const validator:Function = new Function(
            'return ' + Helper.generateValidateDocumentUpdateFunctionCode(
                test[0])
        assert.strictEqual(typeof validator, 'function'))
        assert.ok(validator.apply(this, test.slice(1)))
    }
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
