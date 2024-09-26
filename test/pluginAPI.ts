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
import {describe, expect, test} from '@jest/globals'
import {copy, Encoding, mask, ThenParameter} from 'clientnode'
import {testEach, testEachPromise} from 'clientnode/dist/test-helper'
import path from 'path'

import {
    Configuration, PackageConfiguration, Plugin, PluginConfiguration
} from '../type'
import configuration from '../configurator'
import {
    callStack,
    callStackSynchronous,
    determineInternalName,
    evaluateConfiguration,
    hotReloadAPIFile,
    hotReloadConfigurationFile,
    hotReloadFiles,
    load,
    loadAll,
    loadAPI,
    loadConfiguration,
    loadConfigurations,
    loadFile
} from '../pluginAPI'
// endregion
// region tests
describe('pluginAPI', (): void => {
    const testConfiguration: Configuration = copy(configuration)

    testEachPromise<typeof callStack>(
        'callStack',
        callStack,

        [
            undefined,
            {configuration: testConfiguration, hook: 'test', plugins: []}],
        [
            null,
            {
                configuration: testConfiguration,
                data: null,
                hook: 'test',
                plugins: []
            }
        ],
        [
            {},
            {
                configuration: testConfiguration,
                data: {},
                hook: 'test',
                plugins: []
            }
        ]
        // TODO add more tests
    )
    testEach<typeof callStackSynchronous>(
        'callStackSynchronous',
        callStackSynchronous,

        [
            undefined,
            {configuration: testConfiguration, hook: 'test', plugins: []}],
        [
            undefined,
            {configuration: testConfiguration, hook: 'test', plugins: []}
        ],
        [
            {},
            {
                configuration: testConfiguration,
                data: {},
                hook: 'test',
                plugins: []
            }
        ]
        // TODO add more tests
    )
    testEach<typeof determineInternalName>(
        'determineInternalName',
        determineInternalName,

        ['', '', /^.+$/]
        // TODO add more tests
    )
    testEach<typeof evaluateConfiguration>(
        'evaluateConfiguration',
        evaluateConfiguration,

        [{}, {}],
        [{a: {package: {}}}, {a: {package: {}}}],
        [{a: {a: 3}}, {a: {__evaluate__: '{a: 2 + 1}'}}],
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
    testEach<typeof hotReloadAPIFile>(
        'hotReloadAPIFile',
        hotReloadAPIFile,

        [[], []]
        // TODO add more tests
    )
    testEach<typeof hotReloadConfigurationFile>(
        'hotReloadConfigurationFile',
        hotReloadConfigurationFile,

        [[], [], []]
        // TODO add more tests
    )
    testEach<typeof hotReloadFiles>(
        'hotReloadFiles',
        hotReloadFiles,

        [[], 'api', 'scope', []]
        // TODO add more tests
    )
    test.each([
        [
            {
                api: null,
                apiFileLoadTimestamps: [],
                apiFilePaths: [
                    path.resolve(
                        configuration.core.context.path, 'dummyPlugin/index.js'
                    )
                ],

                configuration: {
                    dummy: {
                        package: mask(
                            /*
                                eslint-disable
                                @typescript-eslint/no-require-imports
                            */
                            require('../dummyPlugin/package'),
                            /*
                                eslint-enable
                                @typescript-eslint/no-require-imports
                            */
                            {exclude: {webNode: true}}
                        )
                    },
                    ...((
                        /*
                            eslint-disable
                            @typescript-eslint/no-require-imports
                        */
                        require('../dummyPlugin/package')
                        /*
                            eslint-enable @typescript-eslint/no-require-imports
                        */
                    ) as PackageConfiguration).webNode
                } as unknown as Configuration,
                configurationFileLoadTimestamps: [],
                configurationFilePaths: [],

                dependencies: [],

                internalName: 'dummy',
                name: 'dummy',

                packageConfiguration: mask(
                    /* eslint-disable @typescript-eslint/no-require-imports */
                    require('../dummyPlugin/package'),
                    /* eslint-enable @typescript-eslint/no-require-imports */
                    {exclude: {webNode: true}}
                ),

                path: path.resolve(
                    configuration.core.context.path, 'dummyPlugin'
                ),

                scope: null
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
            expected: Plugin, ...parameters: Parameters<typeof load>
        ): Promise<void> => {
            let plugin: Plugin|undefined
            try {
                plugin = await load(...parameters)
            } catch (error) {
                console.error(error)
            }

            if (plugin) {
                expect(plugin.scope).toHaveProperty('test')

                plugin.api = null
                plugin.scope = null

                plugin.apiFileLoadTimestamps = []
                if (Object.prototype.hasOwnProperty.call(
                    plugin, 'configuration'
                ))
                    delete plugin.configuration.package
                plugin.configurationFilePaths = []
                plugin.configurationFileLoadTimestamps = []

                expect(plugin).toStrictEqual(expected)
            }
        }
    )
    test.each([
        [
            {
                api: null,
                apiFileLoadTimestamps: [],
                apiFilePaths: [
                    path.resolve(
                        configuration.core.context.path, 'dummyPlugin/index.js'
                    )
                ],

                configuration: {
                    a: {a: 2} as unknown as PluginConfiguration,
                    dummy: {package: {b: 3}}
                },
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
                ),

                scope: null
            },
            ['index.js'],
            path.resolve(configuration.core.context.path, 'dummyPlugin'),
            'dummyPlugin',
            'dummy',
            {},
            'utf8' as Encoding,
            {
                a: {a: 2} as unknown as PluginConfiguration,
                dummy: {package: {b: 3}}
            },
            [
                path.resolve(
                    configuration.core.context.path, 'dummyPlugin/package.json'
                )
            ]
        ]
    ])(
        '%p === loadAPI(%p, ...)',
        async (
            expected: ThenParameter<ReturnType<typeof loadAPI>>,
            ...parameters: Parameters<typeof loadAPI>
        ): Promise<void> => {
            let plugin: Plugin|undefined
            try {
                plugin = await loadAPI(...parameters)
            } catch (error) {
                console.error(error)
            }

            if (plugin) {
                plugin.api = null

                expect(plugin.scope).toHaveProperty('test')

                plugin.scope = null

                plugin.apiFileLoadTimestamps = []
                plugin.configurationFileLoadTimestamps = []
                expect(plugin).toStrictEqual(expected)
            }
        }
    )
    testEach<typeof loadConfiguration>(
        'loadConfiguration',
        loadConfiguration,

        // No package or application configuration exists.
        [{a: {package: {}}}, 'a', {}, []],
        // No application but package configuration exists.
        [{a: {package: {a: 2}}}, 'a', {a: 2}, []],
        /*
            Application and package configuration exists but application
            configuration is not object and will be interpret as package
            configuration either.
        */
        [{a: {package: {a: 2, b: 3}}}, 'a', {a: 2, b: 3}, []],
        // Application and package configuration exists.
        [
            {
                a: {package: {b: 3}},
                value: {a: 2} as unknown as PluginConfiguration
            },
            'a',
            {a: {value: {a: 2}}, b: 3},
            ['a']
        ],
        /*
            Application and package configuration exists because existing
            application configuration is not and object.
        */
        [
            {a: {package: {b: 3}}, value: 2 as unknown as PluginConfiguration},
            'a',
            {a: {value: 2}, b: 3},
            ['a', 'b']
        ],
        [
            {a: {package: {b: 3}}, value: 2 as unknown as PluginConfiguration},
            'a',
            {a: {value: 2}, b: 3},
            ['z', 'a', 'b']
        ],
        [
            {a: {package: {a: 2}}, value: 3 as unknown as PluginConfiguration},
            'a',
            {a: 2, b: {value: 3}},
            ['b', 'a']
        ]
    )
    testEach<typeof loadConfigurations>(
        'loadConfigurations',
        loadConfigurations,

        [configuration, [], {} as unknown as Configuration],
        [configuration, [], {a: 2} as unknown as Configuration],
        [
            {a: {a: 2}, ...configuration} as unknown as Configuration,
            [{configuration: {a: {a: 2}}} as unknown as Plugin],
            {} as unknown as Configuration
        ]
    )
    testEach<typeof loadFile>(
        'loadFile',
        loadFile,

        [
            // eslint-disable-next-line @typescript-eslint/no-require-imports
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
    testEachPromise<typeof loadAll>(
        'loadAll',
        loadAll,

        [{configuration, plugins: []}, configuration]
    )
})
// endregion
