import type { Encoding, FirstParameter, Mapping, RecursiveEvaluateable } from 'clientnode';
import type { APIFunction, BaseState, Configuration, EvaluateablePartialConfiguration, HookPromiseResult, MetaPluginConfiguration, PackageConfiguration, Plugin, PluginChange, PluginPreloader, ServicePromisesState } from './type';
import { Logger } from 'clientnode';
export declare const log: Logger;
export declare const PLUGIN_PRELOADER: PluginPreloader;
/**
 * Calls all plugin methods for given trigger description asynchronous and
 * waits for their resolved promises.
 * @param givenState - Contains runtime information about current hook.
 * @param parameters - Additional parameters to forward into plugin api.
 * @returns A promise which resolves when all callbacks have resolved their
 * promise holding given potentially modified data.
 */
export declare const callStack: <State extends BaseState<unknown> = ServicePromisesState, Output = undefined>(givenState: Omit<State, 'pluginAPI'>, ...parameters: Array<unknown>) => HookPromiseResult<Output>;
/**
 * Calls all plugin methods for given trigger description synchronous.
 * @param givenState - Contains runtime information about current hook.
 * @param parameters - Additional parameters to forward into plugin api.
 * @returns Given potentially modified data.
 */
export declare const callStackSynchronous: <State extends BaseState<unknown> = ServicePromisesState, Output = void>(givenState: Omit<State, 'pluginAPI'>, ...parameters: Array<unknown>) => Output;
/**
 * Converts given plugin name into the corresponding internal representation.
 * @param name - Name to convert.
 * @param regularExpression - Regular expression pattern which extracts
 * relevant name path as first match group.
 * @returns Transformed name.
 */
export declare const determineInternalName: (name: string, regularExpression: RegExp) => string;
/**
 * Evaluates given configuration object by letting plugins package sub
 * structure untouched.
 * @param configuration - Evaluable configuration structure.
 * @returns Resolved configuration.
 */
export declare const evaluateConfiguration: <Type extends Mapping<unknown> = Configuration>(configuration: RecursiveEvaluateable<Type> | Type) => Promise<Type>;
/**
 * Checks for changed plugin api file in given plugins and reloads them if
 * necessary (new timestamp).
 * @param plugins - List of plugins to search for updates in.
 * @returns A list with plugins which have a changed api scope.
 */
export declare const hotReloadAPIFile: (plugins: Array<Plugin>) => Promise<Array<Plugin>>;
/**
 * Checks for changed plugin configurations in given plugins and reloads them
 * if necessary (new timestamp).
 * @param plugins - List of plugins to search for updates in.
 * @param configurationPropertyNames - Property names to search for to use as
 * entry in plugin configuration file.
 * @returns A list with plugins which have a changed configurations.
 */
export declare const hotReloadConfigurationFile: (plugins: Array<Plugin>, configurationPropertyNames: Array<string>) => Promise<Array<Plugin>>;
/**
 * Checks for changed plugin file type in given plugins and reloads them if
 * necessary (timestamp has changed).
 * @param type - Plugin file type to search for updates.
 * @param target - Property name existing in plugin meta information objects
 * which should be updated.
 * @param plugins - List of plugins to search for updates in.
 * @returns A list with plugin changes.
 */
export declare const hotReloadFiles: (type: 'api' | 'configuration', target: 'packageConfiguration' | 'scope', plugins: Array<Plugin>) => Promise<Array<PluginChange>>;
/**
 * Combines given plugin configurations into one and returns a plugin specific
 * meta information object.
 * @param name - Name of the plugin.
 * @param configurations - Array of plugin configurations to combine.
 * @param propertyNames - Array of property names to consider in the
 * configuration.
 * @returns An object of plugin specific meta information.
 */
export declare const combinePluginConfigurations: (name: string, configurations: Array<object>, propertyNames?: Array<string>) => {
    name: string;
    configuration: EvaluateablePartialConfiguration;
};
/**
 * Extends given configuration object with given plugin specific ones and
 * returns a plugin specific meta information object.
 * @param name - Name of plugin to extend.
 * @param internalName - Internal name of plugin to extend.
 * @param plugins - List of all yet determined plugin information.
 * @param metaConfiguration - Configuration file configuration.
 * @param pluginPath - Path to given plugin.
 * @param encoding - Encoding to use to read and write from child process's.
 * @returns An object of plugin specific meta information.
 */
export declare const load: (name: string, internalName: string, plugins: Mapping<Plugin>, metaConfiguration: MetaPluginConfiguration, pluginPath: string, encoding?: Encoding) => Promise<Plugin>;
/**
 * Checks whether given file can be executed by the current user.
 * @param filePath - Path to the file to check.
 * @returns A promise resolving to a boolean indicating whether given file is
 * executable.
 */
export declare const isExecutable: (filePath: string) => Promise<boolean>;
/**
 * Creates a function callable by plugin api which calls the corresponding
 * plugin scope method.
 * @param plugins - To search for plugin scope in.
 * @param name - Name of plugin to search for.
 * @returns A function which calls the corresponding plugin scope method.
 */
export declare const createNativeAPIFactory: (plugins: Mapping<Plugin>, name: string) => (state: FirstParameter<APIFunction>, ...parameters: Array<unknown>) => unknown;
/**
 * Creates a function callable by plugin api which runs given executable. The
 * executable gets the hook name and all additional parameters (JSON encoded)
 * as arguments and the current data (JSON encoded) via standard input. It has
 * to print a JSON object to standard output. Its "result" property is used
 * as return value. A "status" of 404 indicates a not implemented hook, any
 * other status from 400 on indicates an error described by an optional
 * "message" property. Without an error status a given "message" is logged.
 * @param filePath - Path to the executable to run.
 * @param name - Name of corresponding plugin to use for proper error
 * messages.
 * @param encoding - Encoding to use to read and write from child process.
 * @returns A function which runs the given executable.
 */
export declare const createExecutableAPIFactory: (filePath: string, name: string, encoding?: Encoding) => ({ data, hook }: {
    data?: unknown;
    hook: string;
}, ...parameters: Array<unknown>) => unknown;
/**
 * Load given plugin api file in given path and generates a plugin specific
 * data structure with useful meta information.
 * @param relativeFilePaths - Paths to file to load relatively from given
 * plugin path.
 * @param pluginPath - Path to plugin directory.
 * @param name - Plugin name to use for proper error messages.
 * @param internalName - Internal plugin name to use for proper error messages.
 * @param plugins - List of plugins to search for trigger callbacks in.
 * @param encoding - Encoding to use to read and write from child process.
 * @param configuration - Plugin specific configurations.
 * @param configurationFilePaths - Plugin specific configuration file paths.
 * @returns Plugin meta information object.
 */
export declare const loadAPI: (relativeFilePaths: Array<string>, pluginPath: string, name: string, internalName: string, plugins: Mapping<Plugin>, encoding?: Encoding, configuration?: EvaluateablePartialConfiguration | null, configurationFilePaths?: Array<string>) => Promise<Plugin>;
/**
 * Loads plugin specific configuration object.
 * @param name - Property name where to inject resolved configuration into
 * global one.
 * @param packageConfiguration - Plugin specific package configuration object.
 * @param configurationPropertyNames - Property names to search for to use as
 * entry in plugin configuration file.
 * @returns Determined configuration object.
 */
export declare const loadConfiguration: (name: string, packageConfiguration: PackageConfiguration, configurationPropertyNames: Array<string>) => EvaluateablePartialConfiguration;
/**
 * Loads given plugin configurations into global configuration.
 * @param plugins - Topological sorted list of plugins to check for
 * configurations.
 * @param configuration - Global configuration to extend with.
 * @returns Updated given configuration object.
 */
export declare const loadConfigurations: (plugins: Array<Plugin>, configuration: Configuration) => Promise<Configuration>;
/**
 * Gathers all existing configuration file paths for given plugin path and
 * file names.
 * @param pluginPath - Path to the plugin directory.
 * @param fileNames - List of configuration file names to check.
 * @returns A list of existing configuration file paths.
 */
export declare const gatherConfigurationFilePaths: (pluginPath: string, fileNames: Array<string>) => Promise<string[]>;
/**
 * Load given api file path and returns exported scope.
 * @param filePath - Path to file to load.
 * @param name - Plugin name to use for proper error messages.
 * @param fallbackScope - Scope to return if an error occurs during loading.
 * If a "null" is given an error will be thrown.
 * @param doLogging - Enables logging.
 * @returns Exported api file scope.
 */
export declare const loadFile: (filePath: string, name: string, fallbackScope?: null | object, doLogging?: boolean) => Promise<object>;
/**
 * Extends given configuration object with all plugin specific ones and returns
 * a topological sorted list of plugins with plugins specific meta information
 * stored.
 * @param configuration - Configuration object to extend and use.
 * @returns A topological sorted list of plugins objects.
 */
export declare const loadAll: (configuration: Configuration) => Promise<{
    configuration: Configuration;
    plugins: Array<Plugin>;
}>;
/**
 * Transform a list of absolute paths respecting the application context.
 * @param configuration - Configuration object.
 * @param configuration.core - Sub configuration web-node.
 * @param configuration.core.context - Sub web-node context configurations.
 * @param configuration.core.context.path - Current web-nodes path.
 * @param locations - Locations to process.
 * @returns Given and processed locations.
 */
export declare const determineLocations: ({ core: { context: { path: contextPath } } }: Configuration, locations?: Array<string> | string) => Array<string>;
/**
 * Checks whether given file path is in provided locations.
 * @param configuration - Configuration object.
 * @param plugins - List of active plugins.
 * @param filePath - Path to search for.
 * @param locations - Locations to search in.
 * @returns A boolean indicating whether given file path is in provided
 * locations.
 */
export declare const isInLocations: (configuration: Configuration, plugins: Array<Plugin>, filePath: string, locations: Array<string> | string) => boolean;
export declare const pluginAPI: {
    readonly callStack: typeof callStack;
    readonly callStackSynchronous: typeof callStackSynchronous;
    readonly determineInternalName: typeof determineInternalName;
    readonly determineLocations: typeof determineLocations;
    readonly evaluateConfiguration: typeof evaluateConfiguration;
    readonly hotReloadAPIFile: typeof hotReloadAPIFile;
    readonly hotReloadConfigurationFile: typeof hotReloadConfigurationFile;
    readonly hotReloadFiles: typeof hotReloadFiles;
    readonly isInLocations: typeof isInLocations;
    readonly load: typeof load;
    readonly loadAll: typeof loadAll;
    readonly loadAPI: typeof loadAPI;
    readonly loadConfiguration: typeof loadConfiguration;
    readonly loadConfigurations: typeof loadConfigurations;
    readonly loadFile: typeof loadFile;
};
export default pluginAPI;
