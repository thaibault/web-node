// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import path from 'path'
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import type {
    DatabaseForbiddenError, ModelConfiguration, Models, Plugin, UpdateStrategy
} from '../type'
import configuration from '../configurator'
import Helper from '../helper'
// endregion
QUnit.module('helper')
QUnit.load()
// region tests
QUnit.test('authenticate', (assert:Object):void => {
    for (const test:Array<any> of [
        [{}],
        [{}, null, {roles: []}],
        [{type: 'Test'}, {}, {roles: []}, {}, {Test: ['users']}, 'type'],
        [{type: 'Test'}, {}, {roles: ['users']}, {}, {Test: []}, 'type']
    ])
        assert.throws(():?true => Helper.authenticate(...test))
    for (const test:Array<any> of [
        [{}, null, {roles: ['_admin']}],
        [{}, {}, {roles: ['_admin']}, {}, {}, 'type'],
        [{type: 'Test'}, {}, {roles: ['users']}, {}, {Test: 'users'}, 'type'],
        [{type: 'Test'}, {}, {roles: ['users']}, {}, {Test: ['users']}, 'type']
    ])
        assert.ok(Helper.authenticate(...test))
})
// / region tools
QUnit.test('checkRechability', async (assert:Object):Promise<?Object> => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        ['unknownURL', false],
        ['unknownURL', false, 301],
        ['http://unknownHostName', true, 200, 0.01, 0.025]
    ])
        try {
            await Helper.checkReachability(...test)
            assert.ok(false)
        } catch (error) {
            assert.ok(true)
        }
    done()
})
QUnit.test('ensureValidationDocumentPresence', async (
    assert:Object
):Promise<void> => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        [{put: ():Promise<void> =>
            new Promise((resolve:Function):number => setTimeout(resolve, 0))
        }, 'test', '', 'Description', false]
    ])
        assert.strictEqual(await Helper.ensureValidationDocumentPresence(
            ...test))
    done()
})
QUnit.test('representObject', (assert:Object):void => {
    for (const test:Array<any> of [
        [{}, '{}'],
        [5, '5'],
        [[], '[]'],
        [{a: 2, b: 3}, '{\n    "a": 2,\n    "b": 3\n}']
    ])
        assert.strictEqual(Helper.representObject(test[0]), test[1])
})
// / endregion
// region plugin
QUnit.test('callPluginStack', async (assert:Object):Promise<any> => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        [['test', []], null],
        [['test', [], null], null],
        [['test', [], {}], {}]
        // TODO add more tests
    ])
        assert.deepEqual(await Helper.callPluginStack(...test[0]), test[1])
    done()
})
QUnit.test('hotReloadPluginFile', async (assert:Object):Promise<any> => {
    for (const test:Array<any> of [
        [['apiFile', 'scope', []], null]
        // TODO add more tests
    ])
        assert.deepEqual(await Helper.hotReloadPluginFile(
            test[0], test[1], test[2]), test[3])
})
QUnit.test('loadPlugin', (assert:Object):void => {
    for (const test:Array<any> of [
        ['dummy', {}, ['a'], './']
    ])
        assert.throws(():Plugin => Helper.loadPlugin(...test))
    for (const test:Array<any> of [
        ['dummy', {}, ['webNode'], path.resolve(
            configuration.context.path,
            configuration.package.webOptimizer.path.source.base,
            'test/dummyPlugin'
        ), {
            apiFilePath: path.resolve(
                configuration.context.path,
                configuration.package.webOptimizer.path.source.base,
                'test/dummyPlugin/index.js'),
            configuration: require('./dummyPlugin/package'),
            name: 'dummy',
            path: path.resolve(
                configuration.context.path,
                configuration.package.webOptimizer.path.source.base,
                'test/dummyPlugin'),
            scope: {}
        }]
    ]) {
        const plugin:Plugin = Helper.loadPlugin(
            test[0], test[1], test[2], test[3])
        delete plugin.api
        delete plugin.apiFileLoadTimestamp
        delete plugin.configurationFilePath
        delete plugin.configurationFileLoadTimestamp
        assert.deepEqual(plugin, test[4])
    }
})
QUnit.test('loadPluginAPI', (assert:Object):void => {
    for (const test:Array<any> of [
        ['index.js', path.resolve(
            configuration.context.path,
            configuration.package.webOptimizer.path.source.base,
            'test/dummyPlugin/'
        ), 'dummy', {}, {a: 2}, path.resolve(
            configuration.context.path,
            configuration.package.webOptimizer.path.source.base,
            'test/dummyPlugin/package.json'
        ), {
            apiFilePath: path.resolve(
                configuration.context.path,
                configuration.package.webOptimizer.path.source.base,
                'test/dummyPlugin/index.js'),
            configuration: {a: 2},
            configurationFilePath: path.resolve(
                configuration.context.path,
                configuration.package.webOptimizer.path.source.base,
                'test/dummyPlugin/package.json'),
            name: 'dummy',
            path: path.resolve(
                configuration.context.path,
                configuration.package.webOptimizer.path.source.base,
                'test/dummyPlugin'),
            scope: {}
        }]
    ]) {
        const plugin:Plugin = Helper.loadPluginAPI(
            test[0], test[1], test[2], test[3], test[4])
        delete plugin.api
        delete plugin.apiFileLoadTimestamp
        delete plugin.configurationFileLoadTimestamp
        assert.deepEqual(plugin, test[5])
    }
})
QUnit.test('loadPluginConfigurations', (assert:Object):void => {
    for (const test:Array<any> of [
        [{}, []]
        // TODO add more tests
    ])
        assert.deepEqual(
            Helper.loadPluginConfigurations(test[0], test[1]), test[3])
})
QUnit.test('loadPluginFile', (assert:Object):void => {
    for (const test:Array<any> of [
        [path.resolve(
            configuration.context.path,
            configuration.package.webOptimizer.path.source.base,
            'test/dummyPlugin/package.json'
        ), 'dummy', null, false, require('./dummyPlugin/package')],
        ['unknown', 'dummy', {a: 2}, false, {a: 2}]
    ])
        assert.deepEqual(
            Helper.loadPluginFile(test[0], test[1], test[2], test[3]), test[4])
})
QUnit.test('loadPlugins', (assert:Object):void => {
    for (const test:Array<any> of [
        [configuration, {}, {plugins: [], configuration}]
    ])
        assert.deepEqual(Helper.loadPlugins(test[0], test[1]), test[2])
})
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
