// #!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons naming
    3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import Tools from 'clientnode'
import path from 'path'

import {Configuration, Plugin} from '../type'
import configuration from '../configurator'
import PluginAPI from '../pluginAPI'
// endregion
// region tests
describe('pluginAPI', ():void => {
    const testConfiguration:Configuration = Tools.copy(configuration)
    test.each([
        [null, 'test', []],
        [null, 'test', [], null],
        [{}, 'test', [], {}]
        // TODO add more tests
    ])(
        `%p === callStack('%s', %p, ...%p)`,
        async (
            expected:any,
            type:string,
            plugins:Array<Plugin>,
            ...parameter:Array<any>
        ):Promise<void> =>
            expect(await PluginAPI.callStack(
                type,
                plugins,
                testConfiguration,
                ...parameter
            )).toStrictEqual(expected)
    )/*
    test('callStackSynchronous', ():void => {
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
    test('hotReloadAPIFile', async ():Promise<void> => {
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
    })
    test('hotReloadConfigurationFile', async ():Promise<void> => {
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
    })
    test('hotReloadFiles', async ():Promise<void> => {
        for (const test:Array<any> of [
            ['api', 'scope', [], []]
            // TODO add more tests
        ])
            try {
                assert.deepEqual(
                    await PluginAPI.hotReloadFiles(...test.slice(
                        0, test.length - 1)),
                    test[test.length - 1])
            } catch (error) {
                console.error(error)
            }
    })
    test('load', async ():Promise<void> => {
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
                plugin.apiFileLoadTimestamps = []
                if (plugin.configuration)
                    delete plugin.configuration.package
                plugin.configurationFilePaths = []
                plugin.configurationFileLoadTimestamps = []
                delete plugin.scope
                assert.deepEqual(plugin, test[5])
            }
        }
    })
    test('loadAPI', async ():Promise<void> => {
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
                plugin.apiFileLoadTimestamps = []
                plugin.configurationFileLoadTimestamps = []
                delete plugin.scope
                assert.deepEqual(plugin, test[8])
            }
        }
    })
    test('loadConfiguration', ():void => {
        for (const test:Array<any> of [
            [{}, [], {package: {}}],
            [{a: 2}, [], {package: {a: 2}}],
            [{a: 2, b: 3}, [], {package: {a: 2, b: 3}}],
            [{a: {value: 2}, b: 3}, ['a'], {package: {b: 3}, value: 2}],
            [{a: {value: 2}, b: 3}, ['a', 'b'], {package: {b: 3}, value: 2}],
            [
                {a: {value: 2}, b: 3},
                ['z', 'a', 'b'],
                {package: {b: 3}, value: 2}
            ],
            [{a: 2, b: {value: 3}}, ['b', 'a'], {package: {a: 2}, value: 3}]
        ])
            assert.deepEqual(
                PluginAPI.loadConfiguration(test[0], test[1]), test[2])
    })
    test('loadConfigurations', ():void => {
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
            /*assert.ok(Tools.equals(
                PluginAPI.loadConfigurations(...test.slice(0, 2)), test[2]))
    })
    test('loadPluginFile', ():void => {
        for (const test:Array<any> of [
            [path.resolve(
                configuration.context.path, 'dummyPlugin/package.json'
            ), 'dummy', null, false, require('../dummyPlugin/package')],
            ['unknown', 'dummy', {a: 2}, false, {a: 2}]
        ])
            assert.deepEqual(PluginAPI.loadFile(...test.slice(0, 4)), test[4])
    })
    test('loadAll', async ():Promise<void> => {
        for (const test:Array<any> of [
            [configuration, {}, {plugins: [], configuration}]
        ])
            try {
                assert.deepEqual(
                    await PluginAPI.loadAll(...test.slice(0, 2)), test[2])
            } catch (error) {
                console.error(error)
            }
    })
    test('removePropertiesInDynamicObjects', ():void => {
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
    })*/
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
