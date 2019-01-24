// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import path from 'path'
import registerTest from 'clientnode/test'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import type {Configuration, Plugin} from '../type'
import configuration from '../configurator'
import PluginAPI from '../pluginAPI'
// endregion
registerTest(async function():Promise<void> {
    this.module('pluginAPI')
    // region tests
    this.test('callStack', async (assert:Object):Promise<void> => {
        const done:Function = assert.async()
        const testConfiguration:Configuration = Tools.copy(configuration)
        for (const test:Array<any> of [
            [['test', []], null],
            [['test', [], null], null],
            [['test', [], {}], {}]
            // TODO add more tests
        ])
            try {
                assert.deepEqual(await PluginAPI.callStack(
                    test[0][0], test[0][1], testConfiguration,
                    ...test[0].slice(2)
                ), test[1])
            } catch (error) {
                console.error(error)
            }
        done()
    })
    this.test('callStackSynchronous', (assert:Object):void => {
        const testConfiguration:Configuration = Tools.copy(configuration)
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
    this.test('hotReloadAPIFile', async (assert:Object):Promise<any> => {
        const done:Function = assert.async()
        for (const test:Array<any> of [
            [[], []]
            // TODO add more tests
        ])
            try {
                assert.deepEqual(
                    await PluginAPI.hotReloadAPIFile(test[0]), test[1])
            } catch (error) {
                console.error(error)
            }
        done()
    })
    this.test('hotReloadConfigurationFile', async (
        assert:Object
    ):Promise<any> => {
        const done:Function = assert.async()
        for (const test:Array<any> of [
            [[], [], []]
            // TODO add more tests
        ])
            try {
                assert.deepEqual(
                    await PluginAPI.hotReloadConfigurationFile(...test.slice(
                        0, test.length - 1)),
                    test[test.length - 1])
            } catch (error) {
                console.error(error)
            }
        done()
    })
    this.test('hotReloadFile', async (assert:Object):Promise<any> => {
        const done:Function = assert.async()
        for (const test:Array<any> of [
            ['apiFile', 'scope', [], []]
            // TODO add more tests
        ])
            try {
                assert.deepEqual(
                    await PluginAPI.hotReloadFile(...test.slice(
                        0, test.length - 1)),
                    test[test.length - 1])
            } catch (error) {
                console.error(error)
            }
        done()
    })
    this.test('load', async (assert:Object):Promise<void> => {
        const done:Function = assert.async()
        for (const test:Array<any> of [
            ['dummy', 'dummy', {}, ['webNode'], path.resolve(
                configuration.context.path, 'dummyPlugin'
            ), {
                apiFilePath: path.resolve(
                    configuration.context.path,
                    'dummyPlugin/index.compiled.js'),
                configuration: require('../dummyPlugin/package').webNode,
                dependencies: [],
                internalName: 'dummy',
                name: 'dummy',
                path: path.resolve(configuration.context.path, 'dummyPlugin')
            }]
        ]) {
            let plugin:?Plugin
            try {
                plugin = await PluginAPI.load(...test.slice(0, 5))
            } catch (error) {
                console.error(error)
            }
            if (plugin) {
                assert.ok(plugin.scope && plugin.scope.hasOwnProperty(
                    'initialize'))
                delete plugin.api
                delete plugin.apiFileLoadTimestamp
                if (plugin.configuration)
                    delete plugin.configuration.package
                delete plugin.configurationFilePath
                delete plugin.configurationFileLoadTimestamp
                delete plugin.scope
                assert.deepEqual(plugin, test[5])
            }
        }
        done()
    })
    this.test('loadAPI', async (assert:Object):Promise<void> => {
        const done:Function = assert.async()
        for (const test:Array<any> of [
            [
                'index.compiled.js',
                path.resolve(configuration.context.path, 'dummyPlugin'),
                'dummyPlugin',
                'dummy',
                {},
                'utf8',
                {a: 2, package: {webNode: {a: 2}}},
                path.resolve(
                    configuration.context.path, 'dummyPlugin/package.json'),
                {
                    apiFilePath: path.resolve(
                        configuration.context.path,
                        'dummyPlugin/index.compiled.js'),
                    configuration: {a: 2, package: {webNode: {a: 2}}},
                    configurationFilePath: path.resolve(
                        configuration.context.path,
                        'dummyPlugin/package.json'),
                    dependencies: [],
                    internalName: 'dummy',
                    name: 'dummyPlugin',
                    path: path.resolve(
                        configuration.context.path, 'dummyPlugin')
                }
            ]
        ]) {
            let plugin:?Plugin
            try {
                plugin = await PluginAPI.loadAPI(...test.slice(
                    0, test.length - 1))
            } catch (error) {
                console.error(error)
            }
            if (plugin) {
                assert.ok(plugin.scope && plugin.scope.hasOwnProperty(
                    'initialize'))
                delete plugin.api
                delete plugin.apiFileLoadTimestamp
                delete plugin.configurationFileLoadTimestamp
                delete plugin.scope
                assert.deepEqual(plugin, test[8])
            }
        }
        done()
    })
    this.test('loadConfigurations', (assert:Object):void => {
        for (const test:Array<any> of [
            [[], {}, configuration],
            [[], {a: 2}, configuration],
            [
                [{configuration: {a: 2}}], {},
                Tools.extend({a: 2}, configuration)
            ]
        ])
            /*
                NOTE: "assert.deepEqual()" isn't compatible with the proxy
                configuration object.
            */
            assert.ok(Tools.equals(
                PluginAPI.loadConfigurations(...test.slice(0, 2)), test[2]))
    })
    this.test('loadPluginFile', (assert:Object):void => {
        for (const test:Array<any> of [
            [path.resolve(
                configuration.context.path, 'dummyPlugin/package.json'
            ), 'dummy', null, false, require('../dummyPlugin/package')],
            ['unknown', 'dummy', {a: 2}, false, {a: 2}]
        ])
            assert.deepEqual(PluginAPI.loadFile(...test.slice(0, 4)), test[4])
    })
    this.test('loadAll', async (assert:Object):Promise<void> => {
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
    this.test('removePropertiesInDynamicObjects', (assert:Object):void => {
        for (const test:Array<any> of [
            [{}, {}],
            [{a: 2}, {a: 2}],
            [{a: 2, __evaluate__: ''}, {__evaluate__: ''}],
            [
                {a: 2, b: {__evaluate__: '', c: 4}},
                {a: 2, b: {__evaluate__: ''}}
            ]
        ])
            assert.deepEqual(
                PluginAPI.removePropertiesInDynamicObjects(test[0]), test[1])
    })
// endregion
}, 'plain')
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
