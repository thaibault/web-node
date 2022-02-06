// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
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
        'callStackSyncronous',
        PluginAPI.callStackSynchronous,

        [null, 'test', [], testConfiguration],
        [null, 'test', [], testConfiguration, null],
        [{}, 'test', [], testConfiguration, {}],
        // TODO add more tests
    )
    testEach<typeof PluginAPI.determineInternalName>(
        'determineInternalName',
        PluginAPI.determineInternalName,

        ['', '', /^.+$/],
        // TODO add more tests
    )
    testEach<typeof PluginAPI.evaluateConfiguration>(
        'evaluateConfiguration',
        PluginAPI.evaluateConfiguration,

        [{}, {}],
        [{a: {}}, {a: {}}],
        [{a: {package: {}}}, {a: {package: {}}}],
        [{a: 3}, {a: {__evaluate__: '2 + 1'}}],
        [{a: {b: 3}}, {a: {b: {__evaluate__: '2 + 1'}}}],
        [
            {a: {package: {b: {__evaluate__: '2 + 1'}}}},
            {a: {package: {b: {__evaluate__: '2 + 1'}}}}
        ],
        [
            {a: {b: 3, package: {b: {__evaluate__: '2 + 1'}}}},
            {a: {
                b: {__evaluate__: '2 + 1'},
                package: {b: {__evaluate__: '2 + 1'}}
            }}
        ]
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
                        configuration.core.context.path, 'dummyPlugin/index.js'
                    )
                ],
                configuration: {
                    dummy: {
                        package: Tools.mask(
                            require('../dummyPlugin/package'),
                            {exclude: {webNode: true}}
                        )
                    },
                    ...require('../dummyPlugin/package').webNode
                },
                configurationFileLoadTimestamps: [],
                configurationFilePaths: [],
                dependencies: [],
                internalName: 'dummy',
                name: 'dummy',
                packageConfiguration: Tools.mask(
                    require('../dummyPlugin/package'),
                    {exclude: {webNode: true}}
                ),
                path: path.resolve(
                    configuration.core.context.path, 'dummyPlugin'
                )
            },
            'dummy',
            'dummy',
            {},
            {fileNames: ['package.json'], propertyNames: ['webNode']},
            path.resolve(configuration.core.context.path, 'dummyPlugin')
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
                        configuration.core.context.path, 'dummyPlugin/index.js'
                    )
                ],
                configuration: {a: 2, dummy: {package: {b: 3}}},
                configurationFileLoadTimestamps: [],
                configurationFilePaths: [
                    path.resolve(
                        configuration.core.context.path,
                        'dummyPlugin/package.json'
                    )
                ],
                dependencies: [],
                internalName: 'dummy',
                name: 'dummyPlugin',
                packageConfiguration: {b: 3},
                path: path.resolve(
                    configuration.core.context.path, 'dummyPlugin'
                )
            },
            ['index.js'],
            path.resolve(configuration.core.context.path, 'dummyPlugin'),
            'dummyPlugin',
            'dummy',
            {},
            ['webNode'],
            'utf8',
            {a: 2, dummy: {package: {b: 3}}},
            [
                path.resolve(
                    configuration.core.context.path, 'dummyPlugin/package.json'
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

        // No package or application configuration exists.
        [{a: {package: {}}}, 'a', {}, []],
        // No application but package configuration exists.
        [{a: {package: {a: 2}}}, 'a', {a: 2}, []],
        /*
            Application and package configuration exists but application
            configuration is not object and will be interpret as package
            configuration either.
        */
        [{a: {package: {a: 2, b: 3}}}, 'a',  {a: 2, b: 3}, []],
        // Application and package configuration exists.
        [{a: {package: {b: 3}}, value: 2}, 'a', {a: {value: 2}, b: 3}, ['a']],
        /*
            Application and package configuration exists because existing
            application configuration is not and object.
        */
        [
            {a: {package: {b: 3}}, value: 2},
            'a',
            {a: {value: 2}, b: 3},
            ['a', 'b']
        ],
        [
            {a: {package: {b: 3}}, value: 2},
            'a',
            {a: {value: 2}, b: 3},
            ['z', 'a', 'b']
        ],
        [
            {a: {package: {a: 2}}, value: 3},
            'a',
            {a: 2, b: {value: 3}},
            ['b', 'a']
        ]
    )
    testEach<typeof PluginAPI.loadConfigurations>(
        'loadConfigurations',
        PluginAPI.loadConfigurations,

        [configuration, [], {}],
        [configuration, [], {a: 2}],
        [{a: 2, ...configuration}, [{configuration: {a: 2}}], {}]
    )
    testEach<typeof PluginAPI.loadFile>(
        'loadFile',
        PluginAPI.loadFile,

        [
            require('../dummyPlugin/package'),
            path.resolve(
                configuration.core.context.path, 'dummyPlugin/package.json'
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
