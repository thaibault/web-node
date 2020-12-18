// #!/usr/bin/env babel-node
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
import {testEach, testEachPromise} from 'clientnode/testHelper'
import path from 'path'

import {Configuration, Plugin} from '../type'
import configuration from '../configurator'
import PluginAPI from '../pluginAPI'
// endregion
// region tests
describe('pluginAPI', ():void => {

    const testConfiguration:Configuration = Tools.copy(configuration)

    testEachPromise<typeof PluginAPI.callStack>(
        'callStack',
        PluginAPI.callStack,

        [null, 'test', [], testConfiguration],
        [null, 'test', [], testConfiguration, null],
        [{}, 'test', [], testConfiguration, {}],
        // TODO add more tests
    )
    testEach<typeof PluginAPI.callStackSynchronous>(
        'callStackSynchronous',
        PluginAPI.callStackSynchronous,

        [null, 'test', [], testConfiguration],
        [null, 'test', [], testConfiguration, null],
        [{}, 'test', [], testConfiguration, {}]
        // TODO add more tests
    )
    testEach<typeof PluginAPI.hotReloadAPIFile>(
        'hotReloadAPIFile',
        PluginAPI.hotReloadAPIFile,

        [[], []]
        // TODO add more tests
    )
    testEach<typeof PluginAPI.hotReloadConfigurationFile>(
        'hotReloadConfigurationFile',
        PluginAPI.hotReloadConfigurationFile,

        [[], [], []]
        // TODO add more tests
    )
    testEach<typeof PluginAPI.hotReloadFiles>(
        'hotReloadFiles',
        PluginAPI.hotReloadFiles,

        [[], 'api', 'scope', []]
        // TODO add more tests
    )
    test.each<[
        ReturnType<typeof PluginAPI.load>, ...Parameters<typeof PluginAPI.load>
    ]>([
        [
            {

                apiFileLoadTimestamps: [],
                apiFilePaths: [
                    path.resolve(
                        configuration.context.path, 'dummyPlugin/index.js'
                    )
                ],
                configuration: require('../dummyPlugin/package').webNode,
                configurationFileLoadTimestamps: [],
                configurationFilePaths: [],
                dependencies: [],
                internalName: 'dummy',
                name: 'dummy',
                path: path.resolve(configuration.context.path, 'dummyPlugin')
            },
            'dummy',
            'dummy',
            {},
            {fileNames: ['package.json'], propertyNames: ['webNode']},
            path.resolve(configuration.context.path, 'dummyPlugin')
        ]
    ])(
        `%p === load('%s', '%s', %p, %p, '%s')`,
        async (
            expected:Plugin,
            ...parameters:Parameters<typeof PluginAPI.load>
        ):Promise<void> => {
            let plugin:Plugin|undefined
            try {
                plugin = await PluginAPI.load(...parameters)
            } catch (error) {
                console.error(error)
            }
            if (plugin) {
                expect(plugin.scope).toHaveProperty('test')
                delete plugin.api
                plugin.apiFileLoadTimestamps = []
                if (plugin.configuration)
                    delete plugin.configuration.package
                plugin.configurationFilePaths = []
                plugin.configurationFileLoadTimestamps = []
                delete plugin.scope
                expect(plugin).toStrictEqual(expected)
            }
        }
    )
    test.each<[
        ReturnType<PluginAPI.loadAPI>, ...Parameters<PluginAPI.loadAPI>
    ]>([
        [
            {
                apiFileLoadTimestamps: [],
                apiFilePaths: [
                    path.resolve(
                        configuration.context.path, 'dummyPlugin/index.js'
                    )
                ],
                configuration: {a: 2, package: {webNode: {a: 2}}},
                configurationFileLoadTimestamps: [],
                configurationFilePaths: [
                    path.resolve(
                        configuration.context.path,
                        'dummyPlugin/package.json'
                    )
                ],
                dependencies: [],
                internalName: 'dummy',
                name: 'dummyPlugin',
                path: path.resolve(configuration.context.path, 'dummyPlugin')
            },
            ['index.js'],
            path.resolve(configuration.context.path, 'dummyPlugin'),
            'dummyPlugin',
            'dummy',
            {},
            'utf8',
            {a: 2, package: {webNode: {a: 2}}},
            [
                path.resolve(
                    configuration.context.path, 'dummyPlugin/package.json'
                )
            ]
        ]
    ])(
        '%p === loadAPI(%p, ...)',
        async (
            expected:ReturnType<typeof PluginAPI.load>,
            ...parameters:Parameters<typeof PluginAPI.load>
        ):Promise<void> => {
            let plugin:Plugin
            try {
                plugin = await PluginAPI.loadAPI(...parameters)
            } catch (error) {
                console.error(error)
            }
            if (plugin) {
                expect(plugin.scope).toHaveProperty('test')
                delete plugin.api
                plugin.apiFileLoadTimestamps = []
                plugin.configurationFileLoadTimestamps = []
                delete plugin.scope
                expect(plugin).toStrictEqual(expected)
            }
        }
    )
    testEach<typeof PluginAPI.loadConfiguration>(
        'loadConfiguration',
        PluginAPI.loadConfiguration,

        [{package: {}}, {}, []],
        [{package: {a: 2}}, {a: 2}, []],
        [{package: {a: 2, b: 3}}, {a: 2, b: 3}, []],
        [{package: {b: 3}, value: 2}, {a: {value: 2}, b: 3}, ['a']],
        [{package: {b: 3}, value: 2}, {a: {value: 2}, b: 3}, ['a', 'b']],
        [{package: {b: 3}, value: 2}, {a: {value: 2}, b: 3}, ['z', 'a', 'b']],
        [{package: {a: 2}, value: 3}, {a: 2, b: {value: 3}}, ['b', 'a']]
    )
    testEach<typeof PluginAPI.loadConfigurations>(
        'loadConfigurations',
        PluginAPI.loadConfigurations,

        [configuration, [], {}],
        [configuration, [], {a: 2}],
        [Tools.extend({a: 2}, configuration), [{configuration: {a: 2}}], {}]
    )
    testEach<typeof PluginAPI.loadFile>(
        'loadFile',
        PluginAPI.loadFile,

        [
            require('../dummyPlugin/package'),
            path.resolve(
                configuration.context.path, 'dummyPlugin/package.json'
            ),
            'dummy',
            null,
            false
        ],
        [{a: 2}, 'unknown', 'dummy', {a: 2}, false]
    )
    testEachPromise<typeof PluginAPI.loadAll>(
        'loadAll',
        PluginAPI.loadAll,

        [{configuration, plugins: []}, configuration]
    )
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
