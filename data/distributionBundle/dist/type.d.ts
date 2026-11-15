import type { Encoding, Mapping, RecursiveEvaluateable, RecursivePartial, UTILITY_SCOPE } from 'clientnode';
import type { WebDocumentationConfiguration } from 'web-documentation/dist/deploy';
import type { callStack, callStackSynchronous, default as pluginAPI, determineInternalName, determineLocations, evaluateConfiguration, hotReloadAPIFile, hotReloadConfigurationFile, hotReloadFiles, isInLocations, load, loadAll, loadAPI, loadConfiguration, loadConfigurations, loadFile } from './pluginAPI';
export type EvaluateConfigurationScope = typeof UTILITY_SCOPE & {
    currentPath: string;
    fs: typeof import('fs/promises');
    path: typeof import('path');
    pluginAPI: typeof pluginAPI;
    webNodePath: string;
    now: Date;
    nowUTCTimestamp: number;
};
export interface MetaPluginConfiguration {
    fileNames: Array<string>;
    propertyNames: Array<string>;
}
/**
 * NOTE: This interface should be extended by plugins to specify their
 * configuration schema.
 * Can be recursive evaluateable.
 */
export interface PluginConfiguration {
    dependencies?: Array<string>;
    name?: string;
    package: PackageConfiguration;
}
export interface WebNodeConfiguration extends PluginConfiguration {
    context: {
        path: string;
        type: string;
    };
    debug: boolean;
    encoding: Encoding;
    interDependencies: Mapping<Array<string> | string>;
    name: string;
    plugin: {
        configuration: MetaPluginConfiguration;
        nameRegularExpressionPattern: string;
        directories: Mapping<{
            nameRegularExpressionPattern?: string;
            path: string;
        }>;
        hotReloading: boolean;
    };
    runtimeConfiguration?: EvaluateablePartialConfiguration;
}
export type Configuration<PluginConfigurationType = Mapping<unknown>> = {
    core: WebNodeConfiguration;
    name: string;
} & PluginConfigurationType & Mapping<PluginConfiguration>;
export type EvaluateablePartialConfiguration = {
    core?: RecursiveEvaluateable<RecursivePartial<WebNodeConfiguration>>;
    name?: string;
} & Mapping<PluginConfiguration>;
export type PackageConfiguration = Mapping<unknown> & {
    webDocumentation?: WebDocumentationConfiguration;
    main?: string;
    name?: string;
    webnode?: EvaluateablePartialConfiguration;
    webNode?: EvaluateablePartialConfiguration;
    webNodeInternalName?: string;
    'web-node'?: EvaluateablePartialConfiguration;
};
export interface Plugin {
    api: APIFunction | null;
    apiFilePaths: Array<string>;
    apiFileLoadTimestamps: Array<number>;
    configuration: EvaluateablePartialConfiguration;
    configurationFileLoadTimestamps: Array<number>;
    configurationFilePaths: Array<string>;
    packageConfiguration: PackageConfiguration;
    dependencies: Array<string>;
    internalName: string;
    name: string;
    path: string;
    scope: null | object;
}
export interface PluginChange {
    newScope: Mapping<unknown>;
    oldScope: null | Mapping<unknown>;
    plugin: Plugin;
    target: 'packageConfiguration' | 'scope';
}
export type HookPromiseResult<Type> = Promise<Type | {
    promise: Type;
}>;
export type PluginPromises<Type extends Promise<unknown> = Promise<unknown>> = Mapping<null | Type>;
export interface PluginPreload {
    name?: string;
    configurations?: Array<PackageConfiguration> | PackageConfiguration;
    scope?: object;
}
export type PluginPreloader = Mapping<PluginPreload>;
export type Services<PluginServiceType = Mapping<unknown>> = Mapping<unknown> & PluginServiceType;
export type ServicePromises<PluginPromiseType = Mapping<unknown>> = Mapping<Promise<unknown>> & PluginPromiseType;
export interface BaseState<Type = undefined, ConfigurationType extends Configuration = Configuration> {
    configuration: ConfigurationType;
    data: Type;
    hook: string;
    plugins: Array<Plugin>;
    pluginAPI: {
        callStack: typeof callStack;
        callStackSynchronous: typeof callStackSynchronous;
        determineInternalName: typeof determineInternalName;
        determineLocations: typeof determineLocations;
        evaluateConfiguration: typeof evaluateConfiguration;
        hotReloadAPIFile: typeof hotReloadAPIFile;
        hotReloadConfigurationFile: typeof hotReloadConfigurationFile;
        hotReloadFiles: typeof hotReloadFiles;
        isInLocations: typeof isInLocations;
        load: typeof load;
        loadAll: typeof loadAll;
        loadAPI: typeof loadAPI;
        loadConfiguration: typeof loadConfiguration;
        loadConfigurations: typeof loadConfigurations;
        loadFile: typeof loadFile;
    };
}
export interface ChangedState<Type = unknown, ConfigurationType extends Configuration = Configuration> extends BaseState<Type, ConfigurationType> {
    triggerHook?: string;
}
export interface ChangedConfigurationState<Type = unknown, ConfigurationType extends Configuration = Configuration> extends ChangedState<Type, ConfigurationType> {
    pluginsWithChangedConfiguration: Array<Plugin>;
    services?: Services;
}
export interface ChangedAPIFileState<Type = unknown, ConfigurationType extends Configuration = Configuration> extends ChangedState<Type, ConfigurationType> {
    pluginsWithChangedAPIFiles: Array<Plugin>;
}
export type APIFunction<Output = unknown, State extends BaseState<unknown> = ServicePromisesState> = (state: Omit<State, 'data'> & {
    data?: State['data'];
}, ...parameters: Array<unknown>) => Output;
export interface ServicesState<Type = undefined, ConfigurationType extends Configuration = Configuration, ServicesType extends Services = Services> extends BaseState<Type, ConfigurationType> {
    services: ServicesType;
}
export interface ServicePromisesState<Type = undefined, ConfigurationType extends Configuration = Configuration, ServicesType extends Services = Services, ServicePromisesType extends ServicePromises = ServicePromises> extends ServicesState<Type, ConfigurationType, ServicesType> {
    servicePromises: ServicePromisesType;
}
/**
 * Plugins can hook into the following life cycle.
 *
 * Starting lifecycle with:
 * ------------------------
 *
 * 1. initialize (async)
 * 1. preConfigurationLoaded (async)
 * 2. postConfigurationLoaded (async)
 * 3. preLoadService (async)
 * 3.a preLoad_A_Service (async)
 * 3.b preLoad_B_Service (async)
 * ...
 * 4. loadService (async)
 * 5.a postLoad_A_Service (async)
 * 5.b postLoad_B_Service (async)
 * 5. postLoadService (async)
 * 6. shouldExit (async)
 * 7. exit (sync)
 *
 * Lifecycle with "hotReloading" (call "callStack" with hook "eventName"):
 * ------------------------------------------------------------------
 *
 * 1. preConfigurationHotLoaded (async)
 * 2. postConfigurationHotLoaded (async)
 * 3. apiFileReloaded (async)
 * 4. eventName (async)
 *
 * Lifecycle without "hotReloading" (call "callStack" with hook "eventName"):
 * ---------------------------------------------------------------------
 *
 * 1. eventName (async)
 */
export interface PluginHandler {
    /**
     * Application started, static configuration loaded and all available
     * plugins are determined and sorted in there dependency specific
     * typological order. Asynchronous tasks are allowed and a returning
     * promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    initialize?(state: BaseState): Promise<void>;
    /**
     * Triggered hook when at least one plugin has a configuration file and
     * configuration object has been initialized. Asynchronous tasks are
     * allowed and a returning promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    preConfigurationLoaded?(state: ChangedConfigurationState): Promise<void>;
    /**
     * Triggered hook when at least one plugin has a configuration file and
     * configuration object has been initialized. Asynchronous tasks are
     * allowed and a returning promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    postConfigurationLoaded?(state: ChangedConfigurationState): Promise<void>;
    /**
     * Plugins are initialized now and plugins should initialize their
     * continues running services (if they have one). Asynchronous tasks are
     * allowed and a returning promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to given and maybe extended object of
     * services.
     */
    preLoadService?(state: ServicesState): Promise<void>;
    /**
     * Plugins are initialized now and plugins should initialize their
     * continues running services (if they have one). Asynchronous tasks are
     * allowed and a returning promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to given and maybe extended object of
     * services.
     */
    /**
     * Plugins have initialized their continues running service and should
     * start them now. A Promise which observes this service should be
     * returned. Asynchronous tasks are allowed and a returning promise will be
     * respected NOTE: You have to wrap a promise in a promise if a continues
     * service should be registered.
     * @param state - Application state.
     * @returns A mapping to promises which correspond to the plugin specific
     * continues services.
     */
    loadService?(state: ServicePromisesState): Promise<null | PluginPromises>;
    /**
     * Plugins have launched their continues running services and returned a
     * corresponding promise which can be observed here.
     * @param state - Application state.
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    /**
     * Plugins have launched their continues running services and returned a
     * corresponding promise which can be observed here.
     * @param state - Application state.
     * @returns A promise which correspond to the plugin specific continues
     * service promises.
     */
    postLoadService?(state: ServicePromisesState): Promise<void>;
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed. Asynchronous tasks are allowed
     * and a returning promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    preConfigurationHotLoaded?(state: ChangedConfigurationState): Promise<void>;
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed. Asynchronous tasks are allowed
     * and a returning promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    postConfigurationHotLoaded?(state: ChangedConfigurationState): Promise<void>;
    /**
     * Triggered hook when at least one plugin has an api file which has been
     * changed and is reloaded. Asynchronous tasks are allowed and a returning
     * promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    apiFileReloaded?(state: ChangedAPIFileState): Promise<void>;
    /**
     * Application has thrown an error and will be closed soon. Asynchronous
     * tasks are allowed and a returning promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    error?(state: ServicesState): Promise<void>;
    /**
     * Triggers if application will be closed soon. Asynchronous tasks are
     * allowed and a returning promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    shouldExit?(state: ServicePromisesState): Promise<void>;
    /**
     * Triggers if application will be closed immediately no asynchronous tasks
     * allowed anymore.
     * @param state - Application state.
     * @returns Nothing.
     */
    exit?(state: ServicePromisesState): void;
}
