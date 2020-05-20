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
    )
    test.each([
        [null, 'test', []],
        [null, 'test', [], null],
        [{}, 'test', [], {}]
        // TODO add more tests
    ])(
        `%p === callStackSynchronous('%s', %p, ` +
        `${Tools.represent(testConfiguration).substring(0, 80)}...}, ...%p)`,
        (
            expected:any,
            hook:string,
            plugins:Array<Plugin>,
            ...parameter:Array<any>
        ):void =>
            expect(PluginAPI.callStackSynchronous(
                hook, plugins, testConfiguration, ...parameter
            )).toStrictEqual(expected)
    )
    test.each([
        [[], []]
        // TODO add more tests
    ])(
        'hotReloadAPIFile(%p) === %p',
        async (
            plugins:Array<Plugin>, expected:Array<Plugin>
        ):Promise<void> => {
            try {
                expect(await PluginAPI.hotReloadAPIFile(plugins))
                    .toStrictEqual(expected)
            } catch (error) {
                console.error(error)
            }
        }
    )
    test.each([
        [[], [], []]
        // TODO add more tests
    ])(
        'hotReloadConfigurationFile(%p, %p) === %p',
        async (
            plugins:Array<Plugin>,
            configurationPropertyNames:Array<string>,
            expected:Array<plugin>
        ):Promise<void> => {
            try {
                expect(await PluginAPI.hotReloadConfigurationFile(
                    plugins, configurationPropertyNames
                )).toStrictEqual(expected)
            } catch (error) {
                console.error(error)
            }
        }
    )
    test.each([
        ['api', 'scope', [], []]
        // TODO add more tests
    ])(
        `hotReloadFiles('%s', '%s', %p) === PROCESSED_PLUGINS`,
        async (
            type:'api'|'configuration',
            target:'configuration'|'scope',
            plugins:Array<Plugin>
        ):Promise<void> => {
            try {
                expect(await PluginAPI.hotReloadFiles(type, target, plugins))
                    .toStrictEqual(plugins)
            } catch (error) {
                console.error(error)
            }
        }
    )
    test.each([
        [
            'dummy',
            'dummy',
            {},
            {fileNames: ['package.json'], propertyNames: ['webNode']},
            path.resolve(configuration.context.path, 'dummyPlugin'),
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
            }
        ]
    ])(
        `load('%s', '%s', %p, %p, '%s') === %p`,
        async (
            name:string,
            internalName:string,
            plugins:{[key:string]:Plugin},
            metaConfiguration:MetaConfiguration,
            pluginPath:string,
            expected:Plugin
        ):Promise<void> => {
            let plugin:Plugin
            try {
                plugin = await PluginAPI.load(
                    name, internalName, plugins, metaConfiguration, pluginPath
                )
            } catch (error) {
                console.error(error)
            }
            if (plugin) {
                expect(plugin.scope).toHaveProperty('initialize')
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
    test.each([
        [
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
            ],
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
            }
        ]
    ])(
        `loadAPI('%s', '%s', '%s', '%s', %p, '%s', %p, %p) === %p`,
        async (
            relativeFilePaths:Array<string>,
            pluginPath:string,
            name:string,
            internalName:string,
            plugins:{[key:string]:Plugin},
            encoding:Encoding = 'utf8',
            configuration:null|PluginConfiguration = null,
            configurationFilePaths:Array<string>,
            expected:Plugin
        ):Promise<void> => {
            let plugin:Plugin
            try {
                plugin = await PluginAPI.loadAPI(
                    relativeFilePaths,
                    pluginPath,
                    name,
                    internalName,
                    plugins,
                    encoding,
                    configuration,
                    configurationFilePaths
                )
            } catch (error) {
                console.error(error)
            }
            if (plugin) {
                expect(plugin.scope).toHaveProperty('initialize')
                delete plugin.api
                plugin.apiFileLoadTimestamps = []
                plugin.configurationFileLoadTimestamps = []
                delete plugin.scope
                expect(plugin).toStrictEqual(expected)
            }
        }
    )
    test.each([
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
    ])(
        'loadConfiguration(%p, %p) === %p',
        (
            packageConfiguration:PlainObject,
            configurationPropertyNames:Array<string>,
            expected:PlainObject
        ):void =>
            expect(PluginAPI.loadConfiguration(
                packageConfiguration, configurationPropertyNames
            )).toStrictEqual(expected)
    )
    test.each([
        [[], {}, configuration],
        [[], {a: 2}, configuration],
        [
            [{configuration: {a: 2}}], {},
            Tools.extend({a: 2}, configuration)
        ]
    ])(
        'loadConfigurations(%p, %p) === %p',
        (
            plugins:Array<Plugin>,
            configuration:Configuration,
            expected:Configuration
        ):void =>
            /*
                NOTE: "assert.deepEqual()" isn't compatible with the proxy
                configuration object.
            */
            expect(PluginAPI.loadConfigurations(plugins, configuration))
                .toStrictEqual(expected)
    )
    test.each([
        [
            path.resolve(
                configuration.context.path, 'dummyPlugin/package.json'
            ),
            'dummy',
            null,
            false,
            require('../dummyPlugin/package')
        ],
        ['unknown', 'dummy', {a: 2}, false, {a: 2}]
    ])(
        `loadFile('%s', '%s', %p, %p) === %p`,
        (
            filePath:string,
            name:string,
            fallbackScope:null|object,
            log:boolean,
            expected:object
        ):void =>
            expect(PluginAPI.loadFile(filePath, name, fallbackScope, log))
                .toStrictEqual(expected)
    )
    test.each([
        [configuration, {}, {plugins: [], configuration}]
    ])('loadAll', async ():Promise<void> => {
        for (const test:Array<any> of )
            try {
                assert.deepEqual(
                    await PluginAPI.loadAll(...test.slice(0, 2)), test[2])
            } catch (error) {
                console.error(error)
            }
    })
    /*
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
