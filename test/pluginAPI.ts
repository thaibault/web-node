// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import type {Encoding, ThenParameter} from 'clientnode'

import type {
    Configuration,
    EvaluateablePartialConfiguration,
    PackageConfiguration,
    Plugin,
    PluginConfiguration
} from '../type'

import {copy, mask} from 'clientnode'
import {
    testEach, testEachAgainstResolvedPromise, testEachResolvedPromise
} from 'clientnode/test-helper'
import {resolve} from 'path'

import {describe, expect, test} from '@jest/globals'

import configuration from '../configurator'
import {
    callStack,
    callStackSynchronous,
    determineInternalName,
    determineLocations,
    evaluateConfiguration,
    hotReloadAPIFile,
    hotReloadConfigurationFile,
    hotReloadFiles,
    isInLocations,
    load,
    loadAPI,
    loadConfiguration,
    loadConfigurations,
    loadFile
} from '../pluginAPI'
// endregion
// region tests
describe('pluginAPI', (): void => {
    const testConfiguration: Configuration = copy(configuration)

    testEachResolvedPromise<typeof callStack>(
        'callStack',
        callStack,

        [
            undefined,
            {
                configuration: testConfiguration,
                data: undefined,
                hook: 'test',
                plugins: []
            }
        ],
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
        ],
        [
            ['some data'],
            {
                configuration: testConfiguration,
                data: {},
                hook: 'test',
                plugins: [{
                    api: () => Promise.resolve(['some data'])
                } as unknown as Plugin]
            }
        ]
    )
    testEach<typeof callStackSynchronous>(
        'callStackSynchronous',
        callStackSynchronous,

        [
            undefined,
            {
                configuration: testConfiguration,
                data: undefined,
                hook: 'test',
                plugins: []
            }
        ],
        [
            undefined,
            {
                configuration: testConfiguration,
                data: undefined,
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
        ],
        [
            ['some data'],
            {
                configuration: testConfiguration,
                data: {},
                hook: 'test',
                plugins: [{
                    api: () => ['some data']
                } as unknown as Plugin]
            }
        ]
    )
    testEach<typeof determineInternalName>(
        'determineInternalName',
        determineInternalName,

        ['', '', /^.+$/],
        ['hans', 'hans', /^.+$/],
        ['haNs', 'ha-ns', /^.+$/],
        ['ha', 'ha-ns', /^([a-z][a-z]).+$/]
    )
    testEachResolvedPromise<typeof evaluateConfiguration>(
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
    )
    testEach<typeof hotReloadConfigurationFile>(
        'hotReloadConfigurationFile',
        hotReloadConfigurationFile,

        [[], [], []]
    )
    testEach<typeof hotReloadFiles>(
        'hotReloadFiles',
        hotReloadFiles,

        [[], 'api', 'scope', []]
    )
    test.each([
        [
            {
                api: null,
                apiFileLoadTimestamps: [],
                apiFilePaths: [
                    resolve(
                        configuration.core.context.path, 'dummyPlugin/index.js'
                    )
                ],

                configurationFileLoadTimestamps: [],
                configurationFilePaths: [],

                dependencies: [],

                internalName: 'dummy',
                name: 'dummy',

                path: resolve(configuration.core.context.path, 'dummyPlugin'),

                scope: null
            } as unknown as Plugin,
            'dummy',
            'dummy',
            {},
            {fileNames: ['package.json'], propertyNames: ['webNode']},
            resolve(configuration.core.context.path, 'dummyPlugin')
        ]
    ])(
        `%p === load('%s', '%s', %p, %p, '%s')`,
        async (
            expected: Plugin, ...parameters: Parameters<typeof load>
        ): Promise<void> => {
            const packageConfiguration =
                await import('../dummyPlugin/package.json')

            expected.configuration.dummy.package = mask(
                packageConfiguration, {exclude: {webNode: true}}
            ) as PackageConfiguration
            expected.configuration =
                {...expected.configuration, ...packageConfiguration.webNode} as
                    unknown as
                    EvaluateablePartialConfiguration
            expected.packageConfiguration =
                expected.configuration.dummy.package

            let plugin: Plugin | undefined
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
                    resolve(
                        configuration.core.context.path, 'dummyPlugin/index.js'
                    )
                ],

                configuration: {
                    a: {a: 2} as unknown as PluginConfiguration,
                    dummy: {package: {b: 3}}
                },
                configurationFileLoadTimestamps: [],
                configurationFilePaths: [
                    resolve(
                        configuration.core.context.path,
                        'dummyPlugin/package.json'
                    )
                ],

                dependencies: [],

                internalName: 'dummy',
                name: 'dummyPlugin',

                packageConfiguration: {b: 3},

                path: resolve(configuration.core.context.path, 'dummyPlugin'),

                scope: null
            },
            ['index.js'],
            resolve(configuration.core.context.path, 'dummyPlugin'),
            'dummyPlugin',
            'dummy',
            {},
            /*
                eslint-disable @typescript-eslint/no-unnecessary-type-assertion
            */
            'utf8' as Encoding,
            /*
                eslint-enable @typescript-eslint/no-unnecessary-type-assertion
            */
            {
                a: {a: 2} as unknown as PluginConfiguration,
                dummy: {package: {b: 3}}
            },
            [
                resolve(
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
            let plugin: Plugin | undefined
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
            configuration is not object and will be interpreted as package
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
    testEachAgainstResolvedPromise<typeof loadFile>(
        'loadFile',
        loadFile,

        [
            import('../dummyPlugin/package.json', {with: {type: 'json'}})
                .then((module) => module.default),
            resolve(
                configuration.core.context.path, 'dummyPlugin/package.json'
            ),
            'dummy',
            null,
            false
        ],
        [Promise.resolve({a: 2}), 'unknown', 'dummy', {a: 2}, false]
    )
    testEach<typeof determineLocations>(
        'determineLocations',
        determineLocations,

        [[''], {core: {context: {path: ''}}} as Configuration, []],
        [
            ['path/to/context'],
            {core: {context: {path: 'path/to/context'}}} as Configuration,
            []
        ],
        [['/a'], {core: {context: {path: ''}}} as Configuration, ['/a']],
        [
            [resolve(__dirname, '/a')],
            {core: {context: {path: __dirname}}} as Configuration,
            ['/a']
        ]
    )
    testEach<typeof isInLocations>(
        'isInLocations',
        isInLocations,

        [false, {core: {context: {path: ''}}} as Configuration, [], '', []],
        [
            true,
            {core: {context: {path: ''}}} as Configuration,
            [],
            '/a',
            ['/a']
        ],
        [
            true,
            {core: {context: {path: ''}}} as Configuration,
            [{path: '/a'} as Plugin],
            '/a',
            ['/a']
        ],
        [
            false,
            {core: {context: {path: ''}}} as Configuration,
            [{path: '/b'} as Plugin],
            '',
            ['/a']
        ],
        [
            true,
            {core: {context: {path: ''}}} as Configuration,
            [{path: ''} as Plugin],
            '/b/a/c',
            ['/b/a']
        ]
    )
})
// endregion
