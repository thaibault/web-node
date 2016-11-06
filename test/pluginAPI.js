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

import type {Configuration, Plugin} from '../type'
import configuration from '../configurator'
import PluginAPI from '../pluginAPI'
// endregion
QUnit.module('pluginAPI')
QUnit.load()
// region tests
QUnit.test('callStack', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    const testConfiguration:Configuration = Tools.copyLimitedRecursively(
        configuration)
    for (const test:Array<any> of [
        [['test', []], null],
        [['test', [], null], null],
        [['test', [], {}], {}]
        // TODO add more tests
    ])
        try {
            assert.deepEqual(await PluginAPI.callStack(
                test[0][0], test[0][1], testConfiguration, ...test[0].slice(2)
            ), test[1])
        } catch (error) {
            console.error(error)
        }
    done()
})
QUnit.test('callStackSynchronous', (assert:Object):void => {
    const testConfiguration:Configuration = Tools.copyLimitedRecursively(
        configuration)
    for (const test:Array<any> of [
        [['test', []], null],
        [['test', [], null], null],
        [['test', [], {}], {}]
        // TODO add more tests
    ])
        assert.deepEqual(PluginAPI.callStackSynchronous(
            test[0][0], test[0][1], testConfiguration, ...test[0].slice(2)
        ), test[1])
})
QUnit.test('hotReloadFile', async (assert:Object):Promise<any> => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        ['apiFile', 'scope', [], []]
        // TODO add more tests
    ])
        try {
            assert.deepEqual(
                await PluginAPI.hotReloadFile(...test.slice(0, 3)), test[3])
        } catch (error) {
            console.error(error)
        }
    done()
})
QUnit.test('load', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        ['dummy', 'dummy', {}, ['a'], './']
    ])
        try {
            await PluginAPI.load(...test)
            assert.ok(false)
        } catch (error) {
            assert.ok(true)
        }
    // TODO this fails
    console.log('A', require('../dummyPlugin/package.json'))
    for (const test:Array<any> of [
        ['dummy', 'dummy', {}, ['webNode'], path.resolve(
            configuration.context.path, 'dummyPlugin'
        ), {
            apiFilePath: path.resolve(
                configuration.context.path, 'dummyPlugin/index.compiled.js'),
            configuration: require('../dummyPlugin/package').webNode,
            dependencies: [],
            internalName: 'dummy',
            name: 'dummy',
            path: path.resolve(configuration.context.path, 'dummyPlugin')
        }]
    ]) {
        try {
            const plugin:Plugin = await PluginAPI.load(...test.slice(0, 5))
        } catch (error) {
            console.error(error)
        }
        assert.ok(plugin.scope && plugin.scope.hasOwnProperty('initialize'))
        delete plugin.api
        delete plugin.apiFileLoadTimestamp
        if (plugin.configuration)
            delete plugin.configuration.package
        delete plugin.configurationFilePath
        delete plugin.configurationFileLoadTimestamp
        delete plugin.scope
        assert.deepEqual(plugin, test[5])
    }
    done()
})
QUnit.test('loadAPI', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        ['index.compiled.js', path.resolve(
            configuration.context.path, 'dummyPlugin'
        ), 'dummyPlugin', 'dummy', {}, 'utf8', {a: 2}, path.resolve(
            configuration.context.path, 'dummyPlugin/package.json'
        ), {
            apiFilePath: path.resolve(
                configuration.context.path, 'dummyPlugin/index.compiled.js'),
            configuration: {a: 2},
            configurationFilePath: path.resolve(
                configuration.context.path, 'dummyPlugin/package.json'),
            dependencies: [],
            internalName: 'dummy',
            name: 'dummyPlugin',
            path: path.resolve(configuration.context.path, 'dummyPlugin')
        }]
    ]) {
        try {
            const plugin:Plugin = await PluginAPI.loadAPI(...test.slice(0, 8))
        } catch (error) {
            console.error(error)
        }
        assert.ok(plugin.scope && plugin.scope.hasOwnProperty('initialize'))
        delete plugin.api
        delete plugin.apiFileLoadTimestamp
        delete plugin.configurationFileLoadTimestamp
        delete plugin.scope
        assert.deepEqual(plugin, test[8])
    }
    done()
})
QUnit.test('loadConfigurations', (assert:Object):void => {
    for (const test:Array<any> of [
        [[], {}, configuration],
        [[], {a: 2}, configuration],
        [
            [{configuration: {a: 2}}],
            Tools.copyLimitedRecursively({}),
            Tools.extendObject({a: 2}, configuration)
        ]
    ])
        assert.deepEqual(
            PluginAPI.loadConfigurations(...test.slice(0, 2)), test[2])
})
QUnit.test('loadPluginFile', (assert:Object):void => {
    for (const test:Array<any> of [
        [path.resolve(
            configuration.context.path, 'dummyPlugin/package.json'
        ), 'dummy', null, false, require('../dummyPlugin/package')],
        ['unknown', 'dummy', {a: 2}, false, {a: 2}]
    ])
        assert.deepEqual(PluginAPI.loadFile(...test.slice(0, 4)), test[4])
})
QUnit.test('loadAll', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        [configuration, {}, {plugins: [], configuration}]
    ])
        try {
            assert.deepEqual(
                await PluginAPI.loadAll(...test.slice(0, 2)), test[2])
        } catch (error) {
            console.error(error)
        }
    done()
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
