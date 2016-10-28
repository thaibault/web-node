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
QUnit.test('callStack', async (assert:Object):Promise<any> => {
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
QUnit.test('hotReloadFile', async (assert:Object):Promise<any> => {
    for (const test:Array<any> of [
        ['apiFile', 'scope', [], []]
        // TODO add more tests
    ])
        assert.deepEqual(await PluginAPI.hotReloadFile(
            test[0], test[1], test[2]
        ), test[3])
})
QUnit.test('load', (assert:Object):void => {
    for (const test:Array<any> of [
        ['dummy', 'dummy', {}, ['a'], './']
    ])
        assert.throws(():Plugin => PluginAPI.load(...test))
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
        const plugin:Plugin = PluginAPI.load(
            test[0], test[1], test[2], test[3], test[4])
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
})
QUnit.test('loadAPI', (assert:Object):void => {
    for (const test:Array<any> of [
        ['index.compiled.js', path.resolve(
            configuration.context.path, 'dummyPlugin'
        ), 'dummyPlugin', 'dummy', {}, {a: 2}, path.resolve(
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
        const plugin:Plugin = PluginAPI.loadAPI(
            test[0], test[1], test[2], test[3], test[4], test[5], test[6])
        assert.ok(plugin.scope && plugin.scope.hasOwnProperty('initialize'))
        delete plugin.api
        delete plugin.apiFileLoadTimestamp
        delete plugin.configurationFileLoadTimestamp
        delete plugin.scope
        assert.deepEqual(plugin, test[7])
    }
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
            PluginAPI.loadConfigurations(test[0], test[1]), test[2])
})
QUnit.test('loadPluginFile', (assert:Object):void => {
    for (const test:Array<any> of [
        [path.resolve(
            configuration.context.path, 'dummyPlugin/package.json'
        ), 'dummy', null, false, require('../dummyPlugin/package')],
        ['unknown', 'dummy', {a: 2}, false, {a: 2}]
    ])
        assert.deepEqual(
            PluginAPI.loadFile(test[0], test[1], test[2], test[3]),
            test[4])
})
QUnit.test('loadALL', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        [configuration, {}, {plugins: [], configuration}]
    ])
        assert.deepEqual(await PluginAPI.loadALL(test[0], test[1]), test[2])
    done()
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
