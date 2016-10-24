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
                test[0][0], test[0][1], testConfiguration, testConfiguration,
                ...test[0].slice(2)
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
QUnit.test('loadPlugin', (assert:Object):void => {
    /*
    for (const test:Array<any> of [
        ['dummy', {}, ['a'], './']
    ])
        assert.throws(():Plugin => PluginAPI.load(...test))
    */
    for (const test:Array<any> of [
        ['dummy', {}, ['webNode'], path.resolve(
            configuration.context.path, 'dummyPlugin'
        ), {
            apiFilePath: path.resolve(
                configuration.context.path, 'dummyPlugin/index.compiled.js'),
            configuration: require('../dummyPlugin/package').webNode,
            name: 'dummy',
            path: path.resolve(configuration.context.path, 'dummyPlugin')
        }]
    ]) {
        const plugin:Plugin = PluginAPI.load(
            test[0], test[1], test[2], test[3])
        assert.ok(plugin.scope.hasOwnProperty('initialize'))
        delete plugin.api
        delete plugin.apiFileLoadTimestamp
        delete plugin.configuration.package
        delete plugin.configurationFilePath
        delete plugin.configurationFileLoadTimestamp
        delete plugin.scope
        assert.deepEqual(plugin, test[4])
    }
})
QUnit.test('loadAPI', (assert:Object):void => {
    for (const test:Array<any> of [
        ['index.compiled.js', path.resolve(
            configuration.context.path, 'dummyPlugin'
        ), 'dummy', {}, {a: 2}, path.resolve(
            configuration.context.path, 'dummyPlugin/package.json'
        ), {
            apiFilePath: path.resolve(
                configuration.context.path, 'dummyPlugin/index.compiled.js'),
            configuration: {a: 2},
            configurationFilePath: path.resolve(
                configuration.context.path, 'dummyPlugin/package.json'),
            name: 'dummy',
            path: path.resolve(configuration.context.path, 'dummyPlugin')
        }]
    ]) {
        const plugin:Plugin = PluginAPI.loadAPI(
            test[0], test[1], test[2], test[3], test[4], test[5])
        assert.ok(plugin.scope.hasOwnProperty('initialize'))
        delete plugin.api
        delete plugin.apiFileLoadTimestamp
        delete plugin.configurationFileLoadTimestamp
        delete plugin.scope
        assert.deepEqual(plugin, test[6])
    }
})
QUnit.test('loadPluginConfigurations', (assert:Object):void => {
    for (const test:Array<any> of [
        [[], {}, {}],
        [[], {a: 2}, {a: 2}]
        // TODO add more tests
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
QUnit.test('loadALL', (assert:Object):void => {
    for (const test:Array<any> of [
        [configuration, {}, {plugins: [], configuration}]
    ])
        assert.deepEqual(PluginAPI.loadALL(test[0], test[1]), test[2])
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
